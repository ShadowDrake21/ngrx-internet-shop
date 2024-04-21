export const handleImageUnavailable = (event: Event): void => {
  const el = event.target as HTMLImageElement;
  el.src = '/assets/images/image-placeholder.png';
};
