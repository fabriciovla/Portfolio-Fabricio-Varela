import gsap from 'gsap'

// Directiva: v-icon-hover en cualquier elemento interactivo. Mientras el
// cursor (o el foco del teclado) está encima, los iconos Material Symbols de
// adentro se "llenan" y engrosan; al salir vuelven. Se logra animando los ejes
// FILL y wght de la fuente variable, que están expuestos como las variables
// CSS --fill y --wght de la clase .ms
export const vIconHover = {
  mounted(el) {
    const icons = () => el.querySelectorAll('.ms')
    const enter = () =>
      gsap.to(icons(), { '--fill': 1, '--wght': 600, duration: 0.35, ease: 'power2.out', overwrite: 'auto' })
    const leave = () =>
      gsap.to(icons(), { '--fill': 0, '--wght': 400, duration: 0.45, ease: 'power2.out', overwrite: 'auto' })

    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)
    el.addEventListener('focusin', enter)
    el.addEventListener('focusout', leave)
    // se guardan para poder sacarlos al desmontar
    el._iconHover = { enter, leave }
  },

  beforeUnmount(el) {
    const { enter, leave } = el._iconHover
    el.removeEventListener('pointerenter', enter)
    el.removeEventListener('pointerleave', leave)
    el.removeEventListener('focusin', enter)
    el.removeEventListener('focusout', leave)
  },
}
