import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

const FAQAccordion: React.FC<FAQAccordionProps> = ({ items }) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          value={`item-${index}`}
          className="border border-[#2A2B30] rounded-lg bg-[#2A2B30] mb-4 last:mb-0"
        >
          <AccordionTrigger className="px-4 py-3 text-[#F0F0F2] hover:text-[#92A1FC] hover:no-underline font-inter">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="px-4 py-3 text-[#C0C1CC] font-inter">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default FAQAccordion; 