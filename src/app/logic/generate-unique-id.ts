export function generateUniqueId() {
  return `${new Date().getTime() * Math.random()}`;
}
