export function phraseCaps(phrase) {
  let omit = ["in", "and", "to", "on", "with", "for"]
  return phrase.split(" ").map(word => {
            if (omit.includes(word)) {return word}
            return word.charAt(0).toUpperCase() + word.slice(1)
          }).join(" ")
}
