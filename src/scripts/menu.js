const menuToggle = document.querySelector('.menu-toggle')
const mobileMenu = document.querySelector('#mobile-menu')
const headerCta = document.querySelector('.header-cta')
const siteLogo = document.querySelector('.site-logo')

if (menuToggle && mobileMenu) {
  const mobileMenuLinks = mobileMenu.querySelectorAll('a')
  const desktopMedia = window.matchMedia('(min-width: 1280px)')

  const openMenu = () => {
    mobileMenu.hidden = false
    menuToggle.setAttribute('aria-expanded', 'true')
    menuToggle.setAttribute('aria-label', 'Chiudi il menu')
    menuToggle.classList.add('is-open')
    document.body.classList.add('menu-open')
  }

  const closeMenu = () => {
    mobileMenu.hidden = true
    menuToggle.setAttribute('aria-expanded', 'false')
    menuToggle.setAttribute('aria-label', 'Apri il menu')
    menuToggle.classList.remove('is-open')
    document.body.classList.remove('menu-open')
  }

  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true'

    if (isOpen) {
      closeMenu()
    } else {
      openMenu()
    }
  })

  mobileMenuLinks.forEach((link) => {
    link.addEventListener('click', closeMenu)
  })

  headerCta?.addEventListener('click', closeMenu)
  siteLogo?.addEventListener('click', closeMenu)

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !mobileMenu.hidden) {
      closeMenu()
      menuToggle.focus()
    }
  })

  desktopMedia.addEventListener('change', (event) => {
    if (event.matches) {
      closeMenu()
    }
  })
}
