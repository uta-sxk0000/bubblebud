import { InfoPage } from "@/components/pages";

export const metadata = {
  title: "Contact",
  description: "Contact BubbleBud customer support for order, shipping, and product questions.",
};

export default function Page() {
  return (
    <InfoPage
      eyebrow="Contact"
      title="Support that feels personal, fast, and clear."
      copy="Reach BubbleBud for order help, product questions, returns, or partnership notes. Use the form below to open a ready-to-send email message directly to the BubbleBud inbox."
      image="/assets/social-tiktok.png"
      contactEmail="sytnix479@gmail.com"
      contact
    />
  );
}
