/**
 * Forms
 * Validation and newsletter subscription
 */

document.addEventListener('DOMContentLoaded', () => {
  initFormValidation();
  initNewsletterForm();
  initContactForm();
  initNewsletterValidation(); // Add newsletter validation
});

/**
 * Newsletter Form Validation
 */
function initNewsletterValidation() {
  const newsletterForm = document.querySelector('.newsletter-form');
  
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      const emailInput = e.target.querySelector('input[type="email"]');
      const email = emailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      // Clear previous error styling
      emailInput.classList.remove('error');
      
      if (!emailRegex.test(email)) {
        e.preventDefault();
        emailInput.classList.add('error');
        
        // Show error message
        showFormMessage(emailInput, 'Por favor, insira um e-mail válido.', 'error');
        return false;
      }
      
      // Show success feedback
      showFormMessage(emailInput, 'E-mail válido! Processando inscrição...', 'success');
      
      // Here you would normally submit to your email service
      // For now, prevent actual submission
      e.preventDefault();
      
      // Simulate success after delay
      setTimeout(() => {
        emailInput.value = '';
        showFormMessage(emailInput, 'Inscrição realizada com sucesso! Verifique seu e-mail.', 'success');
      }, 1500);
    });
  }
}

/**
 * Show form messages
 */
function showFormMessage(inputElement, message, type) {
  // Remove existing message
  const existingMessage = inputElement.parentNode.querySelector('.form-message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  // Create new message
  const messageElement = document.createElement('div');
  messageElement.className = `form-message ${type}`;
  messageElement.textContent = message;
  
  // Insert after the form
  inputElement.parentNode.appendChild(messageElement);
  
  // Remove message after delay
  setTimeout(() => {
    if (messageElement.parentNode) {
      messageElement.remove();
    }
  }, 5000);
}

/**
 * Form Validation
 */
function initFormValidation() {
  const forms = document.querySelectorAll('form[data-validate]');

  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (validateForm(form)) {
        // Form is valid, proceed with submission
        console.log('Form is valid, submitting...');
        // Add your form submission logic here
      }
    });

    // Real-time validation
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        validateField(input);
      });

      input.addEventListener('input', () => {
        if (input.classList.contains('error')) {
          validateField(input);
        }
      });
    });
  });
}

/**
 * Validate entire form
 */
function validateForm(form) {
  let isValid = true;
  const inputs = form.querySelectorAll('input, textarea, select');

  inputs.forEach(input => {
    if (!validateField(input)) {
      isValid = false;
    }
  });

  return isValid;
}

/**
 * Validate individual field
 */
function validateField(field) {
  const value = field.value.trim();
  const type = field.type;
  const required = field.hasAttribute('required');
  let error = '';

  // Clear previous error
  clearFieldError(field);

  // Required validation
  if (required && !value) {
    error = 'Este campo é obrigatório';
  }
  // Email validation
  else if (type === 'email' && value && !isValidEmail(value)) {
    error = 'Por favor, insira um email válido';
  }
  // Phone validation
  else if (type === 'tel' && value && !isValidPhone(value)) {
    error = 'Por favor, insira um telefone válido';
  }
  // URL validation
  else if (type === 'url' && value && !isValidURL(value)) {
    error = 'Por favor, insira uma URL válida';
  }
  // Min length validation
  else if (field.hasAttribute('minlength')) {
    const minLength = parseInt(field.getAttribute('minlength'));
    if (value.length < minLength) {
      error = `Mínimo de ${minLength} caracteres`;
    }
  }
  // Max length validation
  else if (field.hasAttribute('maxlength')) {
    const maxLength = parseInt(field.getAttribute('maxlength'));
    if (value.length > maxLength) {
      error = `Máximo de ${maxLength} caracteres`;
    }
  }

  if (error) {
    showFieldError(field, error);
    return false;
  }

  return true;
}

/**
 * Show field error
 */
function showFieldError(field, message) {
  field.classList.add('error');
  
  let errorElement = field.parentElement.querySelector('.form-error');
  
  if (!errorElement) {
    errorElement = document.createElement('span');
    errorElement.className = 'form-error';
    field.parentElement.appendChild(errorElement);
  }
  
  errorElement.textContent = message;
}

/**
 * Clear field error
 */
function clearFieldError(field) {
  field.classList.remove('error');
  const errorElement = field.parentElement.querySelector('.form-error');
  if (errorElement) {
    errorElement.remove();
  }
}

/**
 * Email validation
 */
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Phone validation (Brazilian format)
 */
function isValidPhone(phone) {
  const regex = /^(\+55\s?)?(\(?\d{2}\)?[\s-]?)?\d{4,5}[\s-]?\d{4}$/;
  return regex.test(phone);
}

/**
 * URL validation
 */
function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Newsletter Form
 */
function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm(form)) return;

    const email = form.querySelector('input[type="email"]').value;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    try {
      // Disable button and show loading state
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';

      // Simulate API call (replace with actual API endpoint)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Success
      showFormMessage(form, 'Obrigado por se inscrever! 🎉', 'success');
      form.reset();

    } catch (error) {
      // Error
      showFormMessage(form, 'Erro ao inscrever. Tente novamente.', 'error');
    } finally {
      // Reset button
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

/**
 * Contact Form
 */
function initContactForm() {
  const form = document.getElementById('contact-form');
  
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm(form)) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    try {
      // Disable button and show loading state
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';

      // Simulate API call (replace with actual API endpoint)
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Form data:', data);

      // Success
      showFormMessage(form, 'Mensagem enviada com sucesso! 🚀', 'success');
      form.reset();

    } catch (error) {
      // Error
      showFormMessage(form, 'Erro ao enviar mensagem. Tente novamente.', 'error');
    } finally {
      // Reset button
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

/**
 * Show form message
 */
function showFormMessage(form, message, type = 'success') {
  let messageElement = form.querySelector('.form-message');

  if (!messageElement) {
    messageElement = document.createElement('div');
    messageElement.className = 'form-message';
    form.appendChild(messageElement);
  }

  messageElement.textContent = message;
  messageElement.className = `form-message form-message-${type}`;
  messageElement.style.display = 'block';

  // Auto hide after 5 seconds
  setTimeout(() => {
    messageElement.style.display = 'none';
  }, 5000);
}

// Export for other modules
window.ERAppsStudio = window.ERAppsStudio || {};
window.ERAppsStudio.forms = {
  validateForm,
  validateField,
  isValidEmail,
  isValidPhone,
  isValidURL
};
