export default function getElement<T extends Element>(selector: string): T {
  const $el = document.querySelector(selector);
  if ($el == null) throw new Error(`Elemento no encontrado: ${selector}`);
  // if (!($el instanceof T)) {
  //   throw new Error(`Elemento encontrado: ${selector} no es del tipo esperado`);
  // }
  return $el as T;
}
