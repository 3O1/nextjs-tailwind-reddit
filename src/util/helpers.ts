/**
 * Generates random strings & characters
 *  - base62 id (all lowercase, uppercase letters & numbers)
 *
 * @param length `number` Number of characters wanted in the returned string
 * @returns {string} The generated random `string`
 */
export function makeId(length: number): string {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/**
 * Turns the string into a slug
 *
 *  - Trims, lowercases
 *  - Replaces whitespaces ` ` with underscores `_`
 *  - Replaces non English characters with their corresponding English characters -> URL friendly
 *
 * @param str {string}
 * @returns {string}
 */
export function sluggify(str: string): string {
  str = str.trim();
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  const from = "åàáãäâèéëêìíïîòóöôùúüûñç·/_,:;";
  const to = "aaaaaaeeeeiiiioooouuuunc------";

  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
  }

  return str
    .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace and replace by -
    .replace(/-+/g, "-") // collapse dashes
    .replace(/^-+/, "") // trim - from start of text
    .replace(/-+$/, "") // trim - from end of text
    .replace(/-/g, "_");
}
