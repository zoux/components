import { PREFIX_COMPONENT_NAME } from '~/__common__/constants'

export function WrapComponent (component) {
  component.name = `${PREFIX_COMPONENT_NAME}${component.name}`

  component.install = function (Vue) {
    Vue.component(component.name, component)
  }

  return component
}
