// Exportar todos los componentes de properties para facilitar las importaciones
export { PropertyHeader } from "./PropertyHeader";
export { PropertyImageGallery } from "./PropertyImageGallery";
export { PropertyBasicInfo } from "./PropertyBasicInfo";
export { PropertyHostInfo } from "./PropertyHostInfo";
export { PropertyDescription } from "./PropertyDescription";
export { PropertyAmenities } from "./PropertyAmenities";
export { PropertyHouseRules } from "./PropertyHouseRules";
export { PropertyBookingCard } from "./PropertyBookingCard";
export { CheckoutModal, type CheckoutFormData } from "./CheckoutModal";
export { SuccessModal } from "./SuccessModal";
export {
  PropertyLoadingState,
  PropertyErrorState,
  PropertyNotFoundState,
} from "./PropertyStates";

// Re-exportar PropertyReviews que ya existía
export { PropertyReviews } from "./PropertyReviews";
export { PropertySearchCard } from "./PropertySearchCard";

// PropertyEditForm usa export default
export { default as PropertyEditForm } from "./PropertyEditForm";
