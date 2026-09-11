-- Learning Section: sample content for end-to-end verification.
--
-- Seeds the Awareness level with two sample topics (one habit-based, one
-- habit-less) exercising every block type, plus a sample habit using the
-- `record_n_transactions` rule. These are marked `is_sample = true` so they can
-- be identified and unpublished when real curriculum content lands.
--
-- Note: infographic/illustration/tutorial screenshot assets must be uploaded to
-- the `learning-assets` storage bucket; the seed references their public paths.

do $$
declare
  level_id uuid;
begin
  insert into public.learning_levels (slug, title, description, "order", published)
  values (
    'awareness',
    'Conciencia financiera',
    'Descubre qué está pasando con tu dinero y empieza a registrar tus finanzas.',
    0,
    true
  )
  on conflict (slug) do nothing;

  select id into level_id from public.learning_levels where slug = 'awareness';

  -- Sample topic with a habit (exercises every block type).
  insert into public.learning_topics (level_id, slug, title, description, "order", blocks, is_sample, published)
  values (
    level_id,
    'primer-presupuesto',
    'Tu primer presupuesto',
    'Aprende a crear tu primer presupuesto personal registrando tus movimientos reales.',
    0,
    '[
      {"id":"h1","type":"heading","payload":{"level":2,"text":"¿Qué es un presupuesto?"}},
      {"id":"c1","type":"concept","payload":{"title":"El presupuesto","body":"Un presupuesto es un plan que te ayuda a decidir **cómo usar tu dinero**. No se trata de restringirte, sino de *tomar el control*."}},
      {"id":"e1","type":"explanation","payload":{"title":"¿Para qué sirve?","body":"Te permite identificar fugas de dinero, planificar metas de ahorro y reducir el estrés financiero."}},
      {"id":"t1","type":"tip","payload":{"title":"Registra todo","body":"El primer mes, anota absolutamente todos tus gastos, incluso los más pequeños."}},
      {"id":"w1","type":"warning","payload":{"title":"Error común","body":"Muchas personas creen que gastan menos de lo que realmente gastan. Los gastos pequeños suman más de lo que imaginas."}},
      {"id":"ex1","type":"example","payload":{"title":"Ejemplo de presupuesto","body":"Ingresos: $2,000. Gastos fijos: $800. Gastos variables: $500. Ahorro: $400. Ocio: $300."}},
      {"id":"q1","type":"quote","payload":{"text":"Un presupuesto es decirle a tu dinero a dónde ir en lugar de preguntarte a dónde se fue.","author":"John C. Maxwell"}},
      {"id":"tb1","type":"table","payload":{"headers":["Categoría","Monto","Tipo"],"rows":[["Renta","$800","Fijo"],["Comida","$500","Variable"],["Ahorro","$400","Prioridad"]]}},
      {"id":"r1","type":"reflection","payload":{"title":"Reflexiona","prompt":"Piensa en la última semana: ¿compraste algo que no necesitabas?"}},
      {"id":"ig1","type":"infographic","payload":{"title":"Ciclo del presupuesto","imagePath":"https://<project>.supabase.co/storage/v1/object/public/learning-assets/levels/awareness/topics/primer-presupuesto/ciclo.png","altText":"Infografía del ciclo del presupuesto"}},
      {"id":"il1","type":"illustration","payload":{"imagePath":"https://<project>.supabase.co/storage/v1/object/public/learning-assets/levels/awareness/topics/primer-presupuesto/flujo.png","altText":"Ilustración del flujo del dinero","caption":"Así fluye tu dinero cada mes"}},
      {"id":"tu1","type":"tutorial","payload":{"title":"Cómo registrar un gasto","steps":[{"text":"Ve a la pestaña de Transacciones y toca el botón de agregar.","imagePath":"https://<project>.supabase.co/storage/v1/object/public/learning-assets/levels/awareness/topics/primer-presupuesto/paso1.png"},{"text":"Ingresa el monto y la descripción del gasto."},{"text":"Elige la cuenta y guarda."}]}},
      {"id":"ha1","type":"habit","payload":{"title":"Registra tus primeros gastos","description":"Registra al menos 3 transacciones en Rumbo para empezar a ver qué pasa con tu dinero.","habitSlug":"record-3-transactions","ruleKey":"record_n_transactions","ruleParams":{"n":3}}}
    ]'::jsonb,
    true,
    true
  )
  on conflict (slug) do nothing;

  -- Sample topic without a habit (verifies manual "mark as complete").
  insert into public.learning_topics (level_id, slug, title, description, "order", blocks, is_sample, published)
  values (
    level_id,
    'conceptos-basicos',
    'Conceptos básicos',
    'Un repaso rápido de los conceptos esenciales de tus finanzas personales.',
    1,
    '[
      {"id":"h2","type":"heading","payload":{"level":2,"text":"Ingresos, gastos y ahorro"}},
      {"id":"c2","type":"concept","payload":{"title":"Ingreso","body":"El dinero que entra cada mes a tus cuentas."}},
      {"id":"c3","type":"concept","payload":{"title":"Gasto","body":"El dinero que sale. Distinguir entre necesidades, deseos y obligaciones es la base de todo."}},
      {"id":"c4","type":"concept","payload":{"title":"Ahorro","body":"La parte que apartas antes de gastar. Gastar menos de lo que ganas es la base de todo."}}
    ]'::jsonb,
    true,
    true
  )
  on conflict (slug) do nothing;

end;
$$;
