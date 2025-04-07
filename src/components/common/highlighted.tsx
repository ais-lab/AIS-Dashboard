import _escapeRegExp from "lodash/escapeRegExp"

const Highlighted = ({
  text = "",
  highlight = "",
}: {
  text: string
  highlight: string
}) => {
  if (!highlight.trim()) {
    return <span>{text}</span>
  }

  var highlightRegex = /'([^']*)'|"([^"]*)"|(\S+)/gi
  var highlightArray = (highlight.match(highlightRegex) || []).map((m) =>
    m.replace(highlightRegex, "$1$2$3")
  )

  const regexpPart = highlightArray.map((a) => `${_escapeRegExp(a)}`).join("|")

  const regex = new RegExp(`(${regexpPart})`, "gi")

  const parts = text.split(regex)
  return (
    <span>
      {parts
        .filter((part) => part)
        .map((part, i) =>
          regex.test(part) ? (
            <mark key={i}>{part}</mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
    </span>
  )
}

export default Highlighted
