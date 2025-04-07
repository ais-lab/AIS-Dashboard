interface Props {
  light: React.ReactNode
  dark: React.ReactNode
}

const ThemedBasedDisplay = ({ light, dark }: Props) => {
  return (
    <>
      <div data-hide-on-theme="dark">{dark}</div>
      <div data-hide-on-theme="light">{light}</div>
    </>
  )
}

export default ThemedBasedDisplay
