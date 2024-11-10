import Image from "next/image";

const BookImage = ({
  alt = "imageUrl",
  imageUrl,
}: {
  alt?: string;
  imageUrl: string;
}) => {
  return (
    <Image
      style={{ borderRadius: "4px" }}
      src={imageUrl}
      alt={alt}
      fill
      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
    />
  );
};
export default BookImage;
