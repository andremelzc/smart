import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/app/api/auth/[...nextauth]/route';
import { executeQuery, oracledb } from '@/src/lib/database';

// --- Definiciones de Tipos ---

// 1. Tipo para los datos que esperamos de GET_CALENDAR
type CalendarDay = {
  date: string;
  isAvailable: number;
  price: number | null;
  status: string;
};

// 2. Tipo para la respuesta de SET_AVAILABILITY (el SP)
type SetAvailabilityResult = {
  errorCode: number;
};

// 3. Tipo para la respuesta del helper de validación
type HostAccessResult = {
  // Oracle devuelve los alias en mayúsculas por defecto
  EXISTS: number; 
};


/**
 * Helper de seguridad: Verifica si el anfitrión autenticado es el dueño de la propiedad.
 */
async function validateHostAccess(hostId: number | string, propertyId: number): Promise<boolean> {
  try {
    const result = await executeQuery(
      `SELECT 1 AS "EXISTS" 
       FROM PROPERTIES 
       WHERE PROPERTY_ID = :propertyId AND HOST_ID = :hostId`,
      { propertyId, hostId }
    // ✅ CASTING: Le decimos a TS la forma de 'rows'
    ) as oracledb.Result<HostAccessResult>; 

    return (result.rows && result.rows.length > 0) || false;
  } catch (error) {
    console.error('Error en validación de acceso:', error);
    return false;
  }
}

/**
 * GET /api/host/properties/[propertyId]/availability
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  const session = await getServerSession(authOptions);

  // Solo requiere estar autenticado
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'No autorizado. Debes iniciar sesión.' }, { status: 401 });
  }

  const resolvedParams = await params;
  const propertyIdNum = parseInt(resolvedParams.propertyId, 10);
  const userId = parseInt(session.user.id);

  const { searchParams } = request.nextUrl;
  const month = searchParams.get('month');
  const year = searchParams.get('year');

  if (!month || !year || isNaN(propertyIdNum)) {
    return NextResponse.json({ message: 'Parámetros inválidos (propertyId, month, year son requeridos)' }, { status: 400 });
  }

  try {
    // Verificar que el usuario sea dueño de la propiedad
    const hasAccess = await validateHostAccess(userId, propertyIdNum);
    if (!hasAccess) {
      return NextResponse.json({ message: 'Acceso denegado. No eres el dueño de esta propiedad.' }, { status: 403 });
    }

    const calendarData = await executeQuery(
      `SELECT 
          TO_CHAR(CAL_DATE, 'YYYY-MM-DD') AS "date",
          IS_AVAILABLE AS "isAvailable",
          PRICE AS "price",
          STATUS AS "status"
      FROM TABLE(PROPERTY_PKG.GET_CALENDAR(
        p_property_id => :propertyId,
        p_month => :month,
        p_year => :year
      ))`,
      {
        propertyId: propertyIdNum,
        month: parseInt(month, 10),
        year: parseInt(year, 10)
      }
    // ✅ CASTING: Le decimos a TS la forma de 'rows'
    ) as oracledb.Result<CalendarDay[]>; 

    // Ahora TS sabe que 'calendarData.rows' es 'CalendarDay[] | undefined'
    return NextResponse.json(calendarData.rows || []);

  } catch (err) {
    console.error('Error en GET /api/host/properties/[id]/availability:', err);
    return NextResponse.json({ message: 'Error interno del servidor al obtener el calendario' }, { status: 500 });
  }
}


/**
 * POST /api/host/properties/[propertyId]/availability
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  const session = await getServerSession(authOptions);

  // Solo requiere estar autenticado
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'No autorizado. Debes iniciar sesión.' }, { status: 401 });
  }

  const resolvedParams = await params;
  const propertyIdNum = parseInt(resolvedParams.propertyId, 10);
  const userId = parseInt(session.user.id);
  
  if (isNaN(propertyIdNum)) {
     return NextResponse.json({ message: 'ID de propiedad inválido' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { startDate, endDate, kind, pricePerNight } = body;

    if (!startDate || !endDate || !kind) {
      return NextResponse.json({ message: 'Faltan parámetros (startDate, endDate, kind)' }, { status: 400 });
    }
    if (kind === 'special' && !pricePerNight) {
      return NextResponse.json({ message: 'El precio (pricePerNight) es requerido para el tipo "special"' }, { status: 400 });
    }

    const hasAccess = await validateHostAccess(userId, propertyIdNum);
    if (!hasAccess) {
      return NextResponse.json({ message: 'Acceso denegado. No eres el dueño de esta propiedad.' }, { status: 403 });
    }

    const result = await executeQuery(
      `BEGIN
        PROPERTY_PKG.SET_AVAILABILITY(
          P_PROPERTY_ID => :propertyId,
          P_START_DATE => TO_DATE(:startDate, 'YYYY-MM-DD'),
          P_END_DATE => TO_DATE(:endDate, 'YYYY-MM-DD'),
          P_KIND => :kind,
          P_PRICE_PER_NIGHT => :pricePerNight,
          P_ERROR_CODE => :errorCode
        );
      END;`,
      {
        propertyId: propertyIdNum,
        startDate: startDate,
        endDate: endDate,
        kind: kind,
        pricePerNight: pricePerNight || null,
        errorCode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    // ✅ CASTING: Le decimos a TS la forma de 'outBinds'
    ) as oracledb.Result<SetAvailabilityResult>; 

    // Ahora TS sabe que 'result.outBinds' es 'SetAvailabilityResult | undefined'
    const errorCode = result.outBinds?.errorCode;

    if (errorCode === 1) {
      return NextResponse.json({ message: 'Conflicto: Ya existe una reserva confirmada en esas fechas.' }, { status: 409 });
    }
    if (errorCode !== 0) {
      return NextResponse.json({ message: 'Error desconocido al guardar en la base de datos' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Calendario actualizado' });

  } catch (err) {
    console.error('Error en POST /api/host/properties/[id]/availability:', err);
    return NextResponse.json({ message: 'Error interno del servidor al guardar la disponibilidad' }, { status: 500 });
  }
}