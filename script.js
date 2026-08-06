(() => {
  "use strict";

  const body = document.body;
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-menu]");
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const closeMenu = () => {
    if (!menuToggle || !menu) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "메뉴 열기");
    menu.classList.remove("is-open");
    body.classList.remove("menu-open");
  };

  if (menuToggle && menu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "메뉴 열기" : "메뉴 닫기");
      menu.classList.toggle("is-open", !isOpen);
      body.classList.toggle("menu-open", !isOpen);
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 768) closeMenu();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu?.classList.contains("is-open")) {
      closeMenu();
      menuToggle?.focus();
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });

      window.setTimeout(
        () => {
          const focusTarget =
            target.querySelector("h1, h2, [tabindex='-1']") || target;
          if (!focusTarget.hasAttribute("tabindex"))
            focusTarget.setAttribute("tabindex", "-1");
          focusTarget.focus({ preventScroll: true });
        },
        reduceMotion ? 0 : 500,
      );
    });
  });

  document.querySelectorAll(".accordion-item button").forEach((button) => {
    button.addEventListener("click", () => {
      const isExpanded = button.getAttribute("aria-expanded") === "true";
      const panelId = button.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : null;

      button.setAttribute("aria-expanded", String(!isExpanded));
      if (panel) panel.hidden = isExpanded;
    });
  });

  const regionFilter = document.querySelector("[data-filter-region]");
  const specialtyFilter = document.querySelector("[data-filter-specialty]");
  const companyList = document.querySelector("[data-company-list]");
  const resultCount = document.querySelector("[data-result-count]");
  const emptyState = document.querySelector("[data-empty-state]");

  const getFilterState = () => ({
    region: regionFilter?.value || "all",
    specialty: specialtyFilter?.value || "all",
  });

  const applyFilterStateToUrl = (filters = getFilterState()) => {
    if (!window.history?.replaceState) return;
    const nextUrl = new URL(window.location.href);

    if (filters.region === "all") nextUrl.searchParams.delete("region");
    else nextUrl.searchParams.set("region", filters.region);

    if (filters.specialty === "all") nextUrl.searchParams.delete("specialty");
    else nextUrl.searchParams.set("specialty", filters.specialty);

    window.history.replaceState({}, "", `${nextUrl.pathname}${nextUrl.search}`);
  };

  const syncDetailLinks = (filters = getFilterState()) => {
    const searchParams = new URLSearchParams();
    if (filters.region !== "all") searchParams.set("region", filters.region);
    if (filters.specialty !== "all")
      searchParams.set("specialty", filters.specialty);

    document.querySelectorAll(".company-card .text-button").forEach((link) => {
      const detailUrl = new URL(
        link.getAttribute("href") || "company-detail.html",
        window.location.href,
      );
      detailUrl.searchParams.delete("region");
      detailUrl.searchParams.delete("specialty");

      searchParams.forEach((value, key) => {
        detailUrl.searchParams.set(key, value);
      });

      link.href = `${detailUrl.pathname}${detailUrl.search}`;
    });
  };

  const filterCompanies = () => {
    if (!companyList) return;
    const cards = [...companyList.querySelectorAll("[data-region]")];
    const { region, specialty } = getFilterState();
    let visibleCount = 0;

    cards.forEach((card) => {
      const matchesRegion = region === "all" || card.dataset.region === region;
      const matchesSpecialty =
        specialty === "all" || card.dataset.specialty === specialty;
      const isVisible = matchesRegion && matchesSpecialty;
      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    if (resultCount) resultCount.textContent = String(visibleCount);
    if (emptyState) emptyState.hidden = visibleCount !== 0;

    applyFilterStateToUrl({ region, specialty });
    syncDetailLinks({ region, specialty });
  };

  const initializeFilters = () => {
    if (!regionFilter || !specialtyFilter) return;
    const currentParams = new URLSearchParams(window.location.search);
    const initialRegion = currentParams.get("region") || "all";
    const initialSpecialty = currentParams.get("specialty") || "all";

    if (["경기", "서울", "인천"].includes(initialRegion)) {
      regionFilter.value = initialRegion;
    } else {
      regionFilter.value = "all";
    }

    if (
      [
        "주택 정원 조성",
        "식재 디자인",
        "데크·휴게 공간",
        "정원 유지관리",
        "상업 공간 조경",
      ].includes(initialSpecialty)
    ) {
      specialtyFilter.value = initialSpecialty;
    } else {
      specialtyFilter.value = "all";
    }

    filterCompanies();
  };

  regionFilter?.addEventListener("change", filterCompanies);
  specialtyFilter?.addEventListener("change", filterCompanies);
  initializeFilters();

  const companyDetails = {
    blue: {
      name: "푸른정원 조경",
      location: "경기 포천",
      category: "주택 정원 조성",
      tagline: "가족의 일상과 계절의 변화를 함께 담는 주택 정원 전문",
      area: "경기 포천·양주·가평",
      address: "경기 포천시 신읍동",
      phone: "031-123-4567",
      career: "12년",
      image: "assets/images/company-1.webp",
      description:
        "가족 구성원의 생활 동선과 반려동물의 안전, 계절에 따른 풍경의 변화를 함께 고려합니다. 자연스러운 디딤돌과 잔디, 수국 중심의 식재로 오래 머물고 싶은 주택 정원을 만듭니다.",
      services: ["주택 정원 조성", "식재 디자인", "정원 유지관리"],
      gallery: [
        "assets/images/company-1.webp",
        "assets/images/company-2.webp",
        "assets/images/garden-hero.webp",
      ],
    },
    forest: {
      name: "숲결 가든",
      location: "경기 남양주",
      category: "식재 디자인",
      tagline: "기존 수목과 지역 환경을 살린 자연주의 식재 디자인",
      area: "경기 남양주·구리·가평",
      address: "경기 남양주시 별내동",
      phone: "031-123-4567",
      career: "9년",
      image: "assets/images/company-2.webp",
      description:
        "대지에 이미 자리 잡은 나무와 햇빛, 토양 조건을 먼저 읽습니다. 수목과 초화가 계절마다 다른 표정을 보여주도록 자연스러운 층을 만들고 지속 가능한 관리 방법을 함께 제안합니다.",
      services: ["식재 디자인", "주택 정원 조성", "정원 유지관리"],
      gallery: [
        "assets/images/company-2.webp",
        "assets/images/garden-hero.webp",
        "assets/images/company-1.webp",
      ],
    },
    maru: {
      name: "마루앤가든",
      location: "경기 광주",
      category: "데크·휴게 공간",
      tagline: "정원과 실내를 자연스럽게 잇는 데크와 휴게 공간 전문",
      area: "경기 광주·성남·용인",
      address: "경기 광주시 오포동",
      phone: "031-123-4567",
      career: "11년",
      image: "assets/images/company-3.webp",
      description:
        "실내의 편안함이 정원까지 이어지도록 생활 동선과 머무는 시간을 먼저 살핍니다. 목재 데크, 그늘 식재, 야외 휴게 공간을 하나의 장면처럼 연결합니다.",
      services: ["데크·휴게 공간", "주택 정원 조성", "식재 디자인"],
      gallery: [
        "assets/images/company-3.webp",
        "assets/images/company-2.webp",
        "assets/images/garden-hero.webp",
      ],
    },
    objet: {
      name: "오브제 가든",
      location: "서울·수도권",
      category: "주택 정원 조성",
      tagline: "도심의 작은 공간을 밀도 높은 녹색 휴식처로 바꾸는 디자인",
      area: "서울 전 지역·경기 서북부",
      address: "서울 강남구 세곡동",
      phone: "02-1234-5678",
      career: "7년",
      image: "assets/images/garden-hero.webp",
      description:
        "테라스와 중정, 협소한 주택 외부 공간의 비례를 세심하게 조정합니다. 관리 부담은 낮추면서도 사계절의 인상이 살아 있는 도심형 정원을 제안합니다.",
      services: ["주택 정원 조성", "식재 디자인", "데크·휴게 공간"],
      gallery: [
        "assets/images/garden-hero.webp",
        "assets/images/company-3.webp",
        "assets/images/company-2.webp",
      ],
    },
    care: {
      name: "그린케어 랩",
      location: "인천·김포",
      category: "정원 유지관리",
      tagline: "계절마다 건강한 정원을 위한 전문 유지관리 서비스",
      area: "인천 전 지역·경기 김포",
      address: "인천 서구 청라동",
      phone: "032-123-4567",
      career: "8년",
      image: "assets/images/company-1.webp",
      description:
        "정기 점검을 바탕으로 전정, 시비, 병충해 관리와 계절 식재를 진행합니다. 정원의 현재 상태와 관리 이력을 알기 쉽게 기록해 다음 계절을 준비합니다.",
      services: ["정원 유지관리", "식재 디자인"],
      gallery: [
        "assets/images/company-1.webp",
        "assets/images/garden-hero.webp",
        "assets/images/company-2.webp",
      ],
    },
    season: {
      name: "계절의 뜰",
      location: "경기 고양",
      category: "식재 디자인",
      tagline: "사계절의 색과 질감을 세심하게 설계하는 초화 식재 전문",
      area: "경기 고양·파주·서울 서북권",
      address: "경기 고양시 덕양구 행신동",
      phone: "031-123-4567",
      career: "10년",
      image: "assets/images/company-2.webp",
      description:
        "개화 시기와 잎의 질감, 겨울철 구조미까지 고려한 초화 식재를 설계합니다. 한 시기만 화려한 정원이 아니라 계절의 흐름이 자연스럽게 이어지는 정원을 만듭니다.",
      services: ["식재 디자인", "주택 정원 조성", "정원 유지관리"],
      gallery: [
        "assets/images/company-2.webp",
        "assets/images/company-1.webp",
        "assets/images/garden-hero.webp",
      ],
    },
  };

  const companyLinks = document.querySelectorAll("[data-company-link]");
  const buildCompaniesUrl = () => {
    const currentParams = new URLSearchParams(window.location.search);
    const nextParams = new URLSearchParams();

    if (currentParams.get("region"))
      nextParams.set("region", currentParams.get("region"));
    if (currentParams.get("specialty"))
      nextParams.set("specialty", currentParams.get("specialty"));

    const queryString = nextParams.toString();
    return queryString ? `companies.html?${queryString}` : "companies.html";
  };

  companyLinks.forEach((link) => {
    link.href = buildCompaniesUrl();
  });

  const detailRoot = document.querySelector("[data-detail-root]");

  if (detailRoot) {
    const detailId =
      new URLSearchParams(window.location.search).get("id") || "maru";
    const detail = companyDetails[detailId] || companyDetails.maru;
    const setText = (selector, value) => {
      document.querySelectorAll(selector).forEach((element) => {
        element.textContent = value;
      });
    };
    const setImage = (selector, source, alt) => {
      const image = document.querySelector(selector);
      if (!image) return;
      image.src = source;
      image.alt = alt;
    };

    setText("[data-detail-name]", detail.name);
    setText("[data-detail-location]", detail.location);
    setText("[data-detail-category]", detail.category);
    setText("[data-detail-tagline]", detail.tagline);
    setText("[data-detail-area]", detail.area);
    setText("[data-detail-address]", detail.address);
    setText("[data-detail-phone]", detail.phone);
    setText("[data-detail-career]", detail.career);
    setText("[data-detail-description]", detail.description);
    setImage(
      "[data-detail-image]",
      detail.image,
      `${detail.name} 대표 시공 정원`,
    );
    setImage(
      "[data-detail-gallery-one]",
      detail.gallery[0],
      `${detail.name} 대표 시공 사례 전경`,
    );
    setImage(
      "[data-detail-gallery-two]",
      detail.gallery[1],
      `${detail.name} 대표 시공 사례 식재`,
    );
    setImage(
      "[data-detail-gallery-three]",
      detail.gallery[2],
      `${detail.name} 대표 시공 사례 휴게 공간`,
    );

    const serviceList = document.querySelector("[data-detail-services]");
    if (serviceList) {
      serviceList.replaceChildren(
        ...detail.services.map((service) => {
          const item = document.createElement("li");
          item.textContent = service;
          return item;
        }),
      );
    }
    document.title = `${detail.name} | WE:GREEN`;
  }

  const inquiryButtons = document.querySelectorAll("[data-inquiry-button]");
  const inquiryFeedback = document.querySelector("[data-inquiry-feedback]");

  inquiryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!inquiryFeedback) return;
      inquiryFeedback.hidden = false;
      inquiryFeedback.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
      });
      window.setTimeout(
        () => inquiryFeedback.focus({ preventScroll: true }),
        reduceMotion ? 0 : 450,
      );
    });
  });

  const registerForm = document.querySelector("[data-register-form]");
  const formSuccess = document.querySelector("[data-form-success]");
  const imageInput = document.querySelector("[data-image-input]");
  const fileFeedback = document.querySelector("[data-file-feedback]");
  const specialtyGroup = document.querySelector("[data-specialty-group]");
  const specialtyCheckboxes = [
    ...document.querySelectorAll('input[name="specialty"]'),
  ];
  const specialtyError = document.querySelector("[data-specialty-error]");

  const validateSpecialties = () => {
    const hasSpecialty = specialtyCheckboxes.some(
      (checkbox) => checkbox.checked,
    );
    specialtyGroup?.setAttribute("aria-invalid", String(!hasSpecialty));
    if (specialtyError) {
      specialtyError.textContent = hasSpecialty
        ? ""
        : "전문 분야를 한 개 이상 선택해 주세요.";
    }
    return hasSpecialty;
  };

  specialtyCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", validateSpecialties);
  });

  imageInput?.addEventListener("change", () => {
    if (!fileFeedback) return;
    const files = [...imageInput.files];

    if (files.length === 0) {
      fileFeedback.textContent = "선택된 이미지가 없습니다.";
      return;
    }

    const visibleNames = files.slice(0, 3).map((file) => file.name);
    const remainder = files.length - visibleNames.length;
    fileFeedback.textContent = `${files.length}장 선택: ${visibleNames.join(", ")}${
      remainder > 0 ? ` 외 ${remainder}장` : ""
    }`;
  });

  registerForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    let firstInvalid = null;

    registerForm
      .querySelectorAll("input, select, textarea")
      .forEach((field) => {
        const error = field.closest(".field")?.querySelector(".field-error");
        field.setAttribute("aria-invalid", String(!field.validity.valid));

        if (error) {
          if (field.validity.valueMissing)
            error.textContent = "필수 항목을 입력해 주세요.";
          else if (field.validity.typeMismatch)
            error.textContent = "올바른 형식으로 입력해 주세요.";
          else if (field.validity.tooShort)
            error.textContent = "20자 이상 입력해 주세요.";
          else error.textContent = "";
        }

        if (!field.validity.valid && !firstInvalid) firstInvalid = field;
      });

    if (!validateSpecialties() && !firstInvalid) {
      firstInvalid = specialtyCheckboxes[0];
    }

    if (firstInvalid) {
      firstInvalid.focus();
      if (formSuccess) formSuccess.hidden = true;
      return;
    }

    if (formSuccess) {
      formSuccess.hidden = false;
      formSuccess.focus();
    }
  });

  const revealElements = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );

    revealElements.forEach((element) => observer.observe(element));
  }
})();
