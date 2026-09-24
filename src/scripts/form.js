const form = document.querySelector('[data-preventivo-form]')

if (form) {
  const nameInput = form.elements.name
  const emailInput = form.elements.email
  const messageInput = form.elements.message

  let fileInput = form.querySelector('[data-preventivo-files]')

  const fileStatus = form.querySelector('[data-file-status]')
  const formStatus = form.querySelector('[data-form-status]')
  const submitButton = form.querySelector('[data-preventivo-submit]')

  const MAX_TOTAL_FILE_SIZE = 10 * 1024 * 1024

  const selectedFiles = []

  fileInput.removeAttribute('name')

  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) {
      return `${Math.max(1, Math.round(bytes / 1024))} KB`
    }

    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const getErrorElement = (fieldName) =>
    form.querySelector(`[data-error-for="${fieldName}"]`)

  const setFieldError = (field, message = '') => {
    const errorElement = getErrorElement(field.name)

    if (!errorElement) {
      return
    }

    if (message) {
      field.setAttribute('aria-invalid', 'true')
      errorElement.textContent = message
      errorElement.hidden = false
      return
    }

    field.removeAttribute('aria-invalid')
    errorElement.textContent = ''
    errorElement.hidden = true
  }

  const setFileError = (message = '') => {
    const errorElement = getErrorElement('photos')

    if (message) {
      fileInput.setAttribute('aria-invalid', 'true')
      errorElement.textContent = message
      errorElement.hidden = false
      return
    }

    fileInput.removeAttribute('aria-invalid')
    errorElement.textContent = ''
    errorElement.hidden = true
  }

  const validateName = () => {
    if (!nameInput.value.trim()) {
      setFieldError(nameInput, 'Inserisci il tuo nome.')
      return false
    }

    setFieldError(nameInput)
    return true
  }

  const validateEmail = () => {
    const value = emailInput.value.trim()

    if (!value) {
      setFieldError(emailInput, 'Inserisci la tua email.')
      return false
    }

    if (!emailInput.validity.valid) {
      setFieldError(emailInput, 'Inserisci un indirizzo email valido.')
      return false
    }

    setFieldError(emailInput)
    return true
  }

  const validateMessage = () => {
    if (!messageInput.value.trim()) {
      setFieldError(messageInput, 'Descrivi brevemente il lavoro da fare.')
      return false
    }

    setFieldError(messageInput)
    return true
  }

  const getFileKey = (file) =>
    `${file.name}-${file.size}-${file.lastModified}-${file.type}`

  const getTotalFileSize = () =>
    selectedFiles.reduce((total, item) => total + item.file.size, 0)

  const updateFileStatus = () => {
    if (!selectedFiles.length) {
      fileStatus.textContent = ''
      return
    }

    const totalSize = getTotalFileSize()

    const label =
      selectedFiles.length === 1
        ? '1 foto selezionata'
        : `${selectedFiles.length} foto selezionate`

    fileStatus.textContent = `${label} · ${formatFileSize(totalSize)}`
  }

  const createNextFileInput = () => {
    const currentInput = fileInput
    const nextInput = currentInput.cloneNode()

    nextInput.value = ''
    nextInput.removeAttribute('name')
    nextInput.removeAttribute('aria-invalid')

    currentInput.removeAttribute('id')
    currentInput.removeAttribute('data-preventivo-files')
    currentInput.removeAttribute('aria-describedby')
    currentInput.removeAttribute('aria-invalid')

    currentInput.name = `attachment_${selectedFiles.length}`
    currentInput.hidden = true

    currentInput.insertAdjacentElement('afterend', nextInput)

    fileInput = nextInput

    fileInput.addEventListener('change', handleFileChange)
  }

  const handleFileChange = () => {
    const file = fileInput.files[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setFileError('Puoi allegare solo immagini.')
      fileInput.value = ''
      return
    }

    const fileKey = getFileKey(file)

    const alreadySelected = selectedFiles.some((item) => item.key === fileKey)

    if (alreadySelected) {
      setFileError('Questa foto è già stata aggiunta.')
      fileInput.value = ''
      return
    }

    const nextTotalSize = getTotalFileSize() + file.size

    if (nextTotalSize > MAX_TOTAL_FILE_SIZE) {
      setFileError('Le foto possono pesare al massimo 10 MB in totale.')
      fileInput.value = ''
      return
    }

    selectedFiles.push({
      key: fileKey,
      file,
    })

    setFileError()
    updateFileStatus()
    createNextFileInput()
  }

  const validateFiles = () => {
    if (getTotalFileSize() > MAX_TOTAL_FILE_SIZE) {
      setFileError('Le foto possono pesare al massimo 10 MB in totale.')
      return false
    }

    setFileError()
    return true
  }

  const validateForm = () => {
    const nameIsValid = validateName()
    const emailIsValid = validateEmail()
    const messageIsValid = validateMessage()
    const filesAreValid = validateFiles()

    return nameIsValid && emailIsValid && messageIsValid && filesAreValid
  }

  const setNextUrl = () => {
    let nextInput = form.querySelector('input[name="_next"]')

    if (!nextInput) {
      nextInput = document.createElement('input')
      nextInput.type = 'hidden'
      nextInput.name = '_next'
      form.append(nextInput)
    }

    const nextUrl = new URL(window.location.href)

    nextUrl.searchParams.set('preventivo', 'inviato')
    nextUrl.hash = 'preventivo'

    nextInput.value = nextUrl.toString()
  }

  const showSuccessFromRedirect = () => {
    const currentUrl = new URL(window.location.href)

    if (currentUrl.searchParams.get('preventivo') !== 'inviato') {
      return
    }

    formStatus.textContent =
      'Richiesta inviata. Ti risponderemo il prima possibile.'

    currentUrl.searchParams.delete('preventivo')

    window.history.replaceState(
      {},
      '',
      `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`,
    )
  }

  nameInput.addEventListener('blur', validateName)
  emailInput.addEventListener('blur', validateEmail)
  messageInput.addEventListener('blur', validateMessage)

  nameInput.addEventListener('input', () => {
    if (nameInput.getAttribute('aria-invalid') === 'true') {
      validateName()
    }
  })

  emailInput.addEventListener('input', () => {
    if (emailInput.getAttribute('aria-invalid') === 'true') {
      validateEmail()
    }
  })

  messageInput.addEventListener('input', () => {
    if (messageInput.getAttribute('aria-invalid') === 'true') {
      validateMessage()
    }
  })

  fileInput.addEventListener('change', handleFileChange)

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    formStatus.textContent = ''

    if (!validateForm()) {
      const firstInvalidField = form.querySelector('[aria-invalid="true"]')

      firstInvalidField?.focus()
      return
    }

    setNextUrl()

    submitButton.disabled = true
    submitButton.textContent = 'INVIO IN CORSO…'
    formStatus.textContent = 'Invio della richiesta in corso…'

    form.submit()
  })

  showSuccessFromRedirect()
}
