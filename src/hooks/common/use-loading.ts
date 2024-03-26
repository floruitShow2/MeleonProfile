import useBoolean from './use-boolean'

export default function useLoading(initValue = false) {
  const { bool: loading, setBool: setLoading } = useBoolean(initValue)

  const toggle = () => {
    setLoading(!loading.value)
  }

  return {
    loading,
    setLoading,
    toggle
  }
}
