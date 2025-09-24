// DOM utility functions for the Nutrify application.

/**
 * Removes all child nodes from an element.
 * @param {HTMLElement} element
 */
export function clear(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

export default {
  clear,
};