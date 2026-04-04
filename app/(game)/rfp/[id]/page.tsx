interface Props {
  params: Promise<{ id: string }>
}

export default async function RfpPage({ params }: Props) {
  const { id } = await params
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Appel d&apos;Offre — {id}</h1>
      {/* RfpView — à implémenter */}
    </div>
  )
}
