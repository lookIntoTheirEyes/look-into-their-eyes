import Image from "next/image";

const BookImage = ({
  alt = "imageUrl",
  imageUrl,
  borderRadius = "4px",
}: {
  alt?: string;
  imageUrl: string;
  borderRadius?: string;
}) => {
  return (
    <Image
      style={{ borderRadius }}
      src={imageUrl}
      alt={alt}
      fill
      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
    />
  );
};
export default BookImage;
