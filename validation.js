document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("applicationForm");
  if (!form) return;

  const locale = document.documentElement.lang === "es" ? "es" : "en";

  const elements = {
    companyName: document.getElementById("companyName"),
    contactPerson: document.getElementById("contactPerson"),
    corporateEmail: document.getElementById("corporateEmail"),
    phone: document.getElementById("phone"),
    companyWebsite: document.getElementById("companyWebsite"),
    mainCountry: document.getElementById("mainCountry"),
    productType: document.getElementById("productType"),
    monthlyVolume: document.getElementById("monthlyVolume"),
    comments: document.getElementById("comments"),
    privacyPolicy: document.getElementById("privacyPolicy"),
    services: Array.from(form.querySelectorAll('input[name="services"]')),
    current3pl: Array.from(form.querySelectorAll('input[name="current3pl"]')),
    formStatus: document.getElementById("formStatus"),
    lowVolumeWarning: document.getElementById("lowVolumeWarning"),
    commentsCounter: document.getElementById("commentsCounter")
  };

  const messages = {
    en: {
      remaining: "remaining",
      commentsOverflow: "Comments cannot exceed 500 characters",
      errors: {
        companyName: "Company name must have at least 2 characters",
        contactPerson: "Enter first and last name of contact",
        corporateEmail: "Enter a valid corporate email (example: <name@company.com>)",
        phone: "Phone must include country code (example: +1 213 555 0147)",
        companyWebsite: "If you include website, it must be a valid URL",
        mainCountry: "Select main operating country",
        productType: "Select the type of product you handle",
        monthlyVolume: "Select estimated monthly volume",
        services: "Select at least one service of interest",
        current3pl: "Indicate if you currently work with another logistics provider",
        privacyPolicy: "You must accept the privacy policy to continue"
      },
      successHtml:
        "<strong>Thank you for your interest in TrackFlow!</strong><br><br>We have received your request. Our commercial team will review your information and contact you within the next 24-48 hours to schedule a call and learn about your logistics needs in detail.<br><br>If you have any urgent inquiry, write to us directly at <strong>comercial@trackflow.com</strong>",
      submitError: "Please correct the highlighted fields and submit again."
    },
    es: {
      remaining: "restantes",
      commentsOverflow: "Los comentarios no pueden superar los 500 caracteres",
      errors: {
        companyName: "El nombre de la empresa debe tener al menos 2 caracteres",
        contactPerson: "Ingresa nombre y apellido de la persona de contacto",
        corporateEmail: "Ingresa un correo corporativo valido (ejemplo: <nombre@empresa.com>)",
        phone: "El telefono debe incluir codigo de pais (ejemplo: +34 976 123 456)",
        companyWebsite: "Si incluyes sitio web, debe ser una URL valida",
        mainCountry: "Selecciona el pais principal de operacion",
        productType: "Selecciona el tipo de producto que gestionas",
        monthlyVolume: "Selecciona el volumen mensual estimado",
        services: "Selecciona al menos un servicio de interes",
        current3pl: "Indica si trabajas actualmente con otro operador logistico",
        privacyPolicy: "Debes aceptar la politica de privacidad para continuar"
      },
      successHtml:
        "<strong>Gracias por tu interes en TrackFlow.</strong><br><br>Hemos recibido tu solicitud. Nuestro equipo comercial revisara tu informacion y te contactara en las proximas 24-48 horas para agendar una llamada y conocer en detalle tus necesidades logisticas.<br><br>Si tienes una consulta urgente, escribe a <strong>comercial@trackflow.com</strong>",
      submitError: "Corrige los campos marcados e intenta enviar de nuevo."
    }
  };

  const errorMessages = messages[locale].errors;

  function setInputState(input, valid) {
    if (!input) return;
    input.classList.remove("border-red-500", "border-emerald-600");
    input.classList.add(valid ? "border-emerald-600" : "border-red-500");
    input.setAttribute("aria-invalid", String(!valid));
  }

  function setError(field, message) {
    const errorEl = document.getElementById(`${field}Error`);
    if (errorEl) errorEl.textContent = message;

    if (elements[field]) {
      elements[field].setAttribute("aria-describedby", `${field}Error`);
      setInputState(elements[field], false);
    }
  }

  function clearError(field) {
    const errorEl = document.getElementById(`${field}Error`);
    if (errorEl) errorEl.textContent = "";

    if (elements[field]) {
      elements[field].setAttribute("aria-describedby", `${field}Error`);
      setInputState(elements[field], true);
    }
  }

  function setGroupError(groupName, message) {
    const errorEl = document.getElementById(`${groupName}Error`);
    if (errorEl) errorEl.textContent = message;
  }

  function clearGroupError(groupName) {
    const errorEl = document.getElementById(`${groupName}Error`);
    if (errorEl) errorEl.textContent = "";
  }

  function normalize(value) {
    return value.trim().replace(/\s+/g, " ");
  }

  function validateCompanyName() {
    const value = normalize(elements.companyName.value);
    if (value.length < 2) {
      setError("companyName", errorMessages.companyName);
      return false;
    }
    clearError("companyName");
    return true;
  }

  function validateContactPerson() {
    const value = normalize(elements.contactPerson.value);
    const words = value.split(" ").filter(Boolean);
    if (words.length < 2) {
      setError("contactPerson", errorMessages.contactPerson);
      return false;
    }
    clearError("contactPerson");
    return true;
  }

  function validateCorporateEmail() {
    const value = normalize(elements.corporateEmail.value);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setError("corporateEmail", errorMessages.corporateEmail);
      return false;
    }
    clearError("corporateEmail");
    return true;
  }

  function validatePhone() {
    const value = normalize(elements.phone.value);
    const phoneRegex = /^\+\d{1,3}[\d\s().-]{5,}$/;
    if (!phoneRegex.test(value)) {
      setError("phone", errorMessages.phone);
      return false;
    }
    clearError("phone");
    return true;
  }

  function validateCompanyWebsite() {
    const value = normalize(elements.companyWebsite.value);
    if (!value) {
      clearError("companyWebsite");
      return true;
    }
    const urlRegex = /^https?:\/\/.+/i;
    if (!urlRegex.test(value)) {
      setError("companyWebsite", errorMessages.companyWebsite);
      return false;
    }
    clearError("companyWebsite");
    return true;
  }

  function validateMainCountry() {
    if (!elements.mainCountry.value) {
      setError("mainCountry", errorMessages.mainCountry);
      return false;
    }
    clearError("mainCountry");
    return true;
  }

  function validateProductType() {
    if (!elements.productType.value) {
      setError("productType", errorMessages.productType);
      return false;
    }
    clearError("productType");
    return true;
  }

  function validateMonthlyVolume() {
    if (!elements.monthlyVolume.value) {
      setError("monthlyVolume", errorMessages.monthlyVolume);
      return false;
    }
    clearError("monthlyVolume");
    return true;
  }

  function validateServices() {
    const selected = elements.services.some((checkbox) => checkbox.checked);
    if (!selected) {
      setGroupError("services", errorMessages.services);
      return false;
    }
    clearGroupError("services");
    return true;
  }

  function validateCurrent3pl() {
    const selected = elements.current3pl.some((radio) => radio.checked);
    if (!selected) {
      setGroupError("current3pl", errorMessages.current3pl);
      return false;
    }
    clearGroupError("current3pl");
    return true;
  }

  function validateComments() {
    const value = elements.comments.value;
    const remaining = 500 - value.length;
    elements.commentsCounter.textContent = `${remaining} ${messages[locale].remaining}`;

    if (value.length > 500) {
      const message = `${messages[locale].commentsOverflow} (${remaining} ${messages[locale].remaining})`;
      const errorEl = document.getElementById("commentsError");
      if (errorEl) errorEl.textContent = message;
      setInputState(elements.comments, false);
      return false;
    }

    const errorEl = document.getElementById("commentsError");
    if (errorEl) errorEl.textContent = "";
    setInputState(elements.comments, true);
    return true;
  }

  function validatePrivacyPolicy() {
    if (!elements.privacyPolicy.checked) {
      setError("privacyPolicy", errorMessages.privacyPolicy);
      return false;
    }
    clearError("privacyPolicy");
    return true;
  }

  function updateLowVolumeWarning() {
    const showWarning =
      elements.monthlyVolume.value === "0-100" &&
      Boolean(elements.productType.value);

    elements.lowVolumeWarning.classList.toggle("hidden", !showWarning);
  }

  function validateAll() {
    const checks = [
      validateCompanyName(),
      validateContactPerson(),
      validateCorporateEmail(),
      validatePhone(),
      validateCompanyWebsite(),
      validateMainCountry(),
      validateProductType(),
      validateMonthlyVolume(),
      validateServices(),
      validateCurrent3pl(),
      validateComments(),
      validatePrivacyPolicy()
    ];

    updateLowVolumeWarning();

    return checks.every(Boolean);
  }

  function clearStatus() {
    elements.formStatus.classList.add("hidden");
    elements.formStatus.classList.remove(
      "border-red-300",
      "bg-red-50",
      "text-red-800",
      "border-emerald-300",
      "bg-emerald-50",
      "text-emerald-900"
    );
    elements.formStatus.textContent = "";
  }

  function setStatusSuccess() {
    elements.formStatus.classList.remove("hidden");
    elements.formStatus.classList.add("border-emerald-300", "bg-emerald-50", "text-emerald-900");
    elements.formStatus.innerHTML = messages[locale].successHtml;
  }

  function setStatusError() {
    elements.formStatus.classList.remove("hidden");
    elements.formStatus.classList.add("border-red-300", "bg-red-50", "text-red-800");
    elements.formStatus.textContent = messages[locale].submitError;
  }

  function focusFirstInvalid() {
    const firstInvalid = form.querySelector('[aria-invalid="true"], input:invalid, select:invalid, textarea:invalid');
    if (firstInvalid) {
      firstInvalid.focus();
    }
  }

  elements.companyName.addEventListener("blur", validateCompanyName);
  elements.companyName.addEventListener("input", validateCompanyName);

  elements.contactPerson.addEventListener("blur", validateContactPerson);
  elements.contactPerson.addEventListener("input", validateContactPerson);

  elements.corporateEmail.addEventListener("blur", validateCorporateEmail);
  elements.corporateEmail.addEventListener("input", validateCorporateEmail);

  elements.phone.addEventListener("blur", validatePhone);
  elements.phone.addEventListener("input", validatePhone);

  elements.companyWebsite.addEventListener("blur", validateCompanyWebsite);
  elements.companyWebsite.addEventListener("input", validateCompanyWebsite);

  elements.mainCountry.addEventListener("change", validateMainCountry);

  elements.productType.addEventListener("change", () => {
    validateProductType();
    updateLowVolumeWarning();
  });

  elements.monthlyVolume.addEventListener("change", () => {
    validateMonthlyVolume();
    updateLowVolumeWarning();
  });

  elements.services.forEach((checkbox) => {
    checkbox.addEventListener("change", validateServices);
  });

  elements.current3pl.forEach((radio) => {
    radio.addEventListener("change", validateCurrent3pl);
  });

  elements.comments.addEventListener("input", validateComments);

  elements.privacyPolicy.addEventListener("change", validatePrivacyPolicy);

  form.addEventListener("reset", () => {
    clearStatus();
    elements.lowVolumeWarning.classList.add("hidden");

    [
      "companyName",
      "contactPerson",
      "corporateEmail",
      "phone",
      "companyWebsite",
      "mainCountry",
      "productType",
      "monthlyVolume",
      "privacyPolicy"
    ].forEach((field) => {
      const errorEl = document.getElementById(`${field}Error`);
      if (errorEl) errorEl.textContent = "";
      if (elements[field]) {
        elements[field].classList.remove("border-red-500", "border-emerald-600");
        elements[field].setAttribute("aria-invalid", "false");
      }
    });

    clearGroupError("services");
    clearGroupError("current3pl");

    const commentsError = document.getElementById("commentsError");
    if (commentsError) commentsError.textContent = "";
    elements.commentsCounter.textContent = `500 ${messages[locale].remaining}`;
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearStatus();

    const isValid = validateAll();
    if (!isValid) {
      setStatusError();
      focusFirstInvalid();
      return;
    }

    form.reset();
    setStatusSuccess();
  });

  validateComments();
});
