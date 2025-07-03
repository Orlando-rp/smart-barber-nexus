interface ProgressStepsProps {
  currentStep: number
}

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
  const steps = [
    { num: 1, title: 'Serviço' },
    { num: 2, title: 'Data & Horário' },
    { num: 3, title: 'Dados' }
  ]

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map(({ num, title }, index) => (
        <div key={num} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-medium transition-all duration-300 ${
              currentStep >= num ? 'bg-primary text-primary-foreground shadow-lg scale-110' : 'bg-muted text-muted-foreground'
            }`}>
              {currentStep > num ? '✓' : num}
            </div>
            <span className={`text-xs mt-2 transition-colors ${
              currentStep >= num ? 'text-primary font-medium' : 'text-muted-foreground'
            }`}>
              {title}
            </span>
          </div>
          {index < 2 && (
            <div className={`w-20 h-1 mx-4 rounded-full transition-all duration-300 ${
              currentStep > num ? 'bg-primary' : 'bg-muted'
            }`} />
          )}
        </div>
      ))}
    </div>
  )
}