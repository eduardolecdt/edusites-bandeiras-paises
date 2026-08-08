import { defineComponent, ref, watchEffect, h } from 'vue'
import { svgBandeira, svgBandeiraAsync, urlBandeira, temBandeira } from './core.js'

export default defineComponent({
  name: 'SvgBandeira',
  props: {
    codigo: { type: String, required: true },
    tamanho: { type: [Number, String], default: 18 },
    redonda: { type: Boolean, default: false },
    inline: { type: Boolean, default: false },
    alt: { type: String, default: undefined },
    className: { type: String, default: undefined }
  },
  setup(props) {
    const svg = ref(props.inline ? svgBandeira(props.codigo) || '' : '')

    const dimensao = () => {
      const t = props.tamanho
      if (t == null) return '18px'
      return typeof t === 'number' || /^\d+$/.test(String(t)) ? `${t}px` : String(t)
    }

    const estilo = () => {
      const d = dimensao()
      const base = `width:${d};height:${d};object-fit:cover;display:inline-block;flex-shrink:0`
      return props.redonda ? `${base};border-radius:50%` : base
    }

    watchEffect(async () => {
      if (!props.inline) return
      const { codigo } = props
      const sincrono = svgBandeira(codigo)
      if (sincrono) {
        svg.value = sincrono
        return
      }
      const resultado = await svgBandeiraAsync(codigo)
      if (props.codigo === codigo) svg.value = resultado || ''
    })

    return () => {
      const classe = props.className ? `edusites-bandeira ${props.className}` : 'edusites-bandeira'

      if (props.inline) {
        return h('span', {
          class: classe,
          style: `${estilo()};line-height:0`,
          innerHTML: svg.value
        })
      }

      const url = urlBandeira(props.codigo)
      if (!url) return h('span', { class: classe, style: estilo() })

      return h('img', {
        class: classe,
        src: url,
        alt: props.alt == null ? props.codigo.toUpperCase() : props.alt,
        loading: 'lazy',
        decoding: 'async',
        style: estilo()
      })
    }
  }
})

export { temBandeira }
