import { IconType } from "react-icons";

export default function SocialIcon({
  href,
  Icon,
}: {
  href: string;
  Icon: IconType;
  size?: number;
}) {
  return (
    <a href={href} key={href} target='_blank' rel='noopener noreferrer'>
      <Icon></Icon>
    </a>
  );
}
