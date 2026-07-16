export interface MockTaskDefinition {
  taskKind: "achievement" | "follow_up"
  validationMode: "automatic" | "manual"
  ruleKey?: string
}

export interface MockBlock {
  id: string
  type: string
  payload: Record<string, string>
  taskDefinition?: MockTaskDefinition
}

export interface MockTopic {
  id: string
  slug: string
  title: string
  description: string
  order: number
  dependsOn: string[]
  blocks: MockBlock[]
}

export interface MockPath {
  id: string
  slug: string
  title: string
  description: string
  topics: MockTopic[]
}

export interface MockTopicProgress {
  status: "not_started" | "in_progress" | "completed"
  startedAt: string | null
  completedAt: string | null
}

export interface MockTaskProgress {
  status: "pending" | "completed"
  completedAt: string | null
  evaluatedAt: string | null
}

export interface MockProgress {
  topicStatus: Record<string, MockTopicProgress>
  taskStatus: Record<string, MockTaskProgress>
}

export const MOCK_PATH: MockPath = {
  id: "mock-path-001",
  slug: "camino-financiero",
  title: "Tu camino financiero",
  description:
    "Aprende a organizar tus finanzas personales paso a paso, aplicando cada concepto directamente en Rumbo.",
  topics: [
    {
      id: "topic-presupuesto",
      slug: "presupuesto",
      title: "Presupuesto",
      description:
        "Aprende a crear y mantener un presupuesto personal usando tus ingresos y gastos reales.",
      order: 1,
      dependsOn: [],
      blocks: [
        {
          id: "block-concept-01",
          type: "concept",
          payload: {
            title: "¿Qué es un presupuesto?",
            body: "Un presupuesto es un plan que te ayuda a decidir cómo usar tu dinero. Te permite saber cuánto ganas, cuánto gastas y cuánto puedes ahorrar cada mes. No se trata de restringirte, sino de tomar el control.",
          },
        },
        {
          id: "block-explanation-01",
          type: "explanation",
          payload: {
            title: "¿Para qué sirve un presupuesto?",
            body: "Con un presupuesto puedes identificar fugas de dinero, planificar metas de ahorro, prepararte para gastos imprevistos y reducir el estrés financiero. Es la base de todas las demás decisiones financieras.",
          },
        },
        {
          id: "block-tip-01",
          type: "tip",
          payload: {
            title: "Registra todo",
            body: "El primer mes, anota absolutamente todos tus gastos, incluso los más pequeños. Un café diario de $2 se convierte en $60 al mes. Solo viendo los números reales puedes tomar decisiones informadas.",
          },
        },
        {
          id: "block-example-01",
          type: "example",
          payload: {
            title: "Ejemplo de presupuesto mensual",
            body: "Ingresos: $2,000. Gastos fijos (renta, servicios): $800. Gastos variables (comida, transporte): $500. Ahorro: $400. Ocio: $300. Este es un presupuesto balanceado donde el ahorro es una prioridad, no lo que sobra.",
          },
        },
        {
          id: "block-warning-01",
          type: "warning",
          payload: {
            title: "Error común: subestimar gastos",
            body: "Muchas personas creen que gastan menos de lo que realmente gastan. Los gastos pequeños y frecuentes (suscripciones, propinas, antojos) suman más de lo que imaginas. No los ignores al hacer tu presupuesto.",
          },
        },
        {
          id: "block-reflection-01",
          type: "reflection",
          payload: {
            title: "Reflexiona sobre tus gastos",
            prompt:
              "Piensa en la última semana: ¿compraste algo que no necesitabas? ¿Cuánto crees que gastas al mes en cosas que no son esenciales? Anota tus reflexiones aquí.",
          },
        },
        {
          id: "block-exercise-01",
          type: "exercise",
          payload: {
            title: "Ejercicio: estima tus gastos del mes",
            body: "Sin mirar tus cuentas, escribe cuánto crees que gastas en cada categoría: vivienda, alimentación, transporte, ocio, otros. Luego, en las próximas semanas, compara tus estimaciones con tus gastos reales en Rumbo.",
            placeholder: "Próximamente podrás ingresar tus estimaciones directamente aquí.",
          },
        },
        {
          id: "block-task-achievement-01",
          type: "task",
          payload: {
            title: "Crear tu primer presupuesto",
            description:
              "Usa la herramienta de presupuesto de Rumbo para definir tus categorías de gasto y asignar un monto mensual a cada una.",
          },
          taskDefinition: {
            taskKind: "achievement",
            validationMode: "manual",
          },
        },
        {
          id: "block-task-followup-01",
          type: "task",
          payload: {
            title: "Mantener tu presupuesto actualizado",
            description:
              "Cada mes, revisa tu presupuesto y ajusta los montos según tus gastos reales. Las finanzas cambian y tu presupuesto debe reflejar esos cambios.",
          },
          taskDefinition: {
            taskKind: "follow_up",
            validationMode: "automatic",
            ruleKey: "budget_updated_this_month",
          },
        },
      ],
    },
    {
      id: "topic-fondo-emergencia",
      slug: "fondo-emergencia",
      title: "Fondo de emergencia",
      description:
        "Aprende por qué necesitas un fondo de emergencia y cómo empezar a construirlo, incluso con poco dinero.",
      order: 2,
      dependsOn: ["presupuesto"],
      blocks: [
        {
          id: "block-concept-02",
          type: "concept",
          payload: {
            title: "¿Qué es un fondo de emergencia?",
            body: "Un fondo de emergencia es dinero reservado exclusivamente para imprevistos: una reparación del auto, una emergencia médica, o la pérdida del empleo. No es para vacaciones ni para compras planificadas.",
          },
        },
        {
          id: "block-tip-02",
          type: "tip",
          payload: {
            title: "Empieza con poco",
            body: "No necesitas ahorrar meses de gastos de inmediato. Comienza con una meta pequeña, como $500. Alcanzar ese primer objetivo te dará confianza para seguir ahorrando hasta llegar a 3-6 meses de gastos básicos.",
          },
        },
        {
          id: "block-warning-02",
          type: "warning",
          payload: {
            title: "No uses tu fondo para gastos planeados",
            body: "Las vacaciones, regalos de fin de año o renovar el celular NO son emergencias. Son gastos predecibles que debes incluir en tu presupuesto mensual, no en tu fondo de emergencia.",
          },
        },
        {
          id: "block-task-achievement-02",
          type: "task",
          payload: {
            title: "Crear una meta de ahorro para tu fondo",
            description:
              "Usa la herramienta de metas de ahorro de Rumbo para crear tu fondo de emergencia con un monto objetivo inicial de al menos $500.",
          },
          taskDefinition: {
            taskKind: "achievement",
            validationMode: "automatic",
            ruleKey: "has_saving_goal_for_emergency_fund",
          },
        },
      ],
    },
  ],
}

export const MOCK_PROGRESS: MockProgress = {
  topicStatus: {
    "topic-presupuesto": {
      status: "in_progress",
      startedAt: "2026-07-10T00:00:00Z",
      completedAt: null,
    },
    "topic-fondo-emergencia": {
      status: "not_started",
      startedAt: null,
      completedAt: null,
    },
  },
  taskStatus: {
    "block-task-achievement-01": {
      status: "completed",
      completedAt: "2026-07-12T00:00:00Z",
      evaluatedAt: null,
    },
    "block-task-followup-01": {
      status: "pending",
      completedAt: null,
      evaluatedAt: "2026-07-15T00:00:00Z",
    },
    "block-task-achievement-02": {
      status: "pending",
      completedAt: null,
      evaluatedAt: null,
    },
  },
}
