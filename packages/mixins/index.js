import { PREFIX_CLASS_NAME } from '~/__common__/constants'

export default {
  methods: {
    c (className) {
      return className.split(' ').map(item => `${PREFIX_CLASS_NAME}${item}`).join(' ')
    }
  }
}
