interface Props {
  params: Promise<{ id: string }>
}

export default async function ScenarioPage({ params }: Props) {
  const { id } = await params
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Scénario {id}</h1>
      {/* ScenarioView — à implémenter */}
    </div>
  )
}
