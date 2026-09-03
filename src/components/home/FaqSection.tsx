import { useState } from "react";
import { FAQ_ITEMS } from "../../data/faq";

export function FaqSection() {
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  return (
    <section className="section faq-section" id="faq" aria-labelledby="faq-title">
      <div className="container faq-grid">
        <div className="section-heading section-heading-left">
          <p className="eyebrow">FAQ</p>
          <h2 id="faq-title">자주 묻는 질문</h2>
          <p>WE:GREEN이 준비하는 서비스에 대해 알려드릴게요.</p>
        </div>
        <div className="accordion">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openFaqId === item.id;
            return (
              <article className="accordion-item" key={item.id}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`${item.id}-panel`}
                    onClick={() =>
                      setOpenFaqId((current) =>
                        current === item.id ? null : item.id,
                      )
                    }
                  >
                    {item.question}
                    <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
                  </button>
                </h3>
                <div
                  className="accordion-panel"
                  id={`${item.id}-panel`}
                  hidden={!isOpen}
                >
                  <p>{item.answer}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
