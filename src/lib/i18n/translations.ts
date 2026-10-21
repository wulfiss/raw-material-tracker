export type Language = 'es' | 'es-AR';

const dailyUse = {
  title: 'Uso diario de materias primas', new: 'Registrar uso diario', edit: 'Corregir registro',
  description: 'Al empezar el día, registrá las materias primas que vas a usar y los productos que vas a preparar.',
  date: 'Fecha de uso', material: 'Materia prima', materialPlaceholder: 'Buscar y seleccionar materia prima…',
  supplier: 'Marca / Proveedor', lot: 'Lote', productLot: 'Lote del producto', expiry: 'Vencimiento', products: 'Productos finales', productSearch: 'Buscar producto…',
  supplierHelp: 'Elegí una sugerencia o escribí una nueva marca o proveedor.',
  supplierSuggested: 'Usado con esta materia prima',
  productHelp: 'Seleccioná uno o varios productos para esta materia prima.', suggested: 'Sugerido por receta',
  previous: 'Usado en el registro anterior', selected: 'seleccionados',
  save: 'Guardar', another: 'Guardar y agregar otra materia prima', saving: 'Guardando…',
  saved: 'Registro guardado. Agregá la siguiente materia prima y confirmá sus productos.',
  back: 'Ver registros', cancel: 'Cancelar', noProducts: 'Agregá un producto en Recetas para empezar.',
  addProduct: 'Agregar producto / receta', noMaterials: 'Agregá una materia prima para empezar.',
  addMaterial: 'Agregar materia prima', noMatches: 'No hay productos que coincidan con la búsqueda.',
  history: 'Productos y materias primas del día', historyHelp: 'Consultá qué lotes se utilizaron en cada producto y fecha.',
  filter: 'Buscar', allDates: 'Todas las fechas', allProducts: 'Todos los productos',
  lotSearch: 'Buscar por lote', empty: 'No hay registros para estos filtros.',
  count: 'registros', previousPage: 'Anterior', nextPage: 'Siguiente', page: 'Página',
  inbound: 'Registrar una recepción completa', by: 'Registrado por',
  messages: {
    supplier: 'Ingresá la marca o el proveedor (hasta 160 caracteres).',
    date: 'Ingresá una fecha de uso válida.', material: 'Seleccioná una materia prima activa de la lista.',
    lot: 'Ingresá el lote (hasta 120 caracteres).', expiry: 'Ingresá una fecha de vencimiento válida.',
    products: 'Seleccioná al menos un producto activo. Revisá los productos seleccionados.',
    unexpected: 'No se pudo guardar. Tus datos se conservaron; intentá nuevamente.',
    load: 'No se pudieron cargar los registros. Intentá nuevamente.',
    notFound: 'No se encontró el registro.', filters: 'Revisá la fecha y el producto del filtro.'
  }
};

const workspace = { daily: 'Registro de uso diario', dashboard: 'Panel', recipes: 'Recetas', navigation: 'Navegación', openMenu: 'Abrir menú', closeMenu: 'Cerrar menú' };
const simpleRecipe = {
  title: 'Recetas y productos finales', new: 'Agregar receta', edit: 'Editar receta',
  description: 'Cada receta es un producto final con su lista de ingredientes.',
  name: 'Nombre del producto final', placeholder: 'Por ejemplo, Empanada de carne',
  ingredients: 'Ingredientes', search: 'Buscar ingrediente…', selected: 'seleccionados',
  help: 'Seleccioná las materias primas que lleva este producto.',
  newMaterial: 'Nuevo ingrediente', newMaterialPlaceholder: 'Nombre de la materia prima', addMaterial: 'Agregar ingrediente',
  added: 'Ingrediente agregado a la lista.', empty: 'Todavía no hay recetas.', noMatches: 'No hay ingredientes que coincidan.',
  save: 'Guardar receta', cancel: 'Cancelar', saving: 'Guardando…', inactive: 'Inactiva',
  messages: {
    name: 'Ingresá el nombre del producto final (hasta 120 caracteres).',
    ingredients: 'Seleccioná al menos un ingrediente válido, sin repetirlo.',
    duplicate: 'Ya existe una receta con ese nombre.',
    materialName: 'Revisá el nombre del nuevo ingrediente (hasta 120 caracteres).',
    inactive: 'Este ingrediente está inactivo. Seleccioná otro ingrediente.',
    save: 'No se pudo guardar. Tus datos se conservaron; intentá nuevamente.',
    notFound: 'No se encontró la receta.'
  }
};
const dashboardView = {
  title: 'Panel de trazabilidad', description: 'Toda la información de uso diario, materias primas y productos finales en un solo lugar.',
  summary: 'Resumen de datos', records: 'Registros de uso', materials: 'Materias primas utilizadas', products: 'Productos finales', lots: 'Lotes de producto',
  from: 'Desde', to: 'Hasta', material: 'Materia prima', allMaterials: 'Todas las materias primas',
  supplier: 'Marca / Proveedor', product: 'Producto final', allProducts: 'Todos los productos', lot: 'Lote de materia prima',
  filter: 'Filtrar', clear: 'Ver todos los datos', date: 'Fecha de producción', expiry: 'Vencimiento',
  operator: 'Registrado por', empty: 'No hay registros para estos filtros.',
  page: 'Página', of: 'de', previous: 'Anterior', next: 'Siguiente',
  showing: 'Registros en esta página', filtersError: 'Revisá las fechas y los filtros seleccionados.'
};

export const translations = {
  es: {
    dailyUse, workspace, simpleRecipe, dashboardView,
    // Login Page
    login: {
      title: 'Iniciar sesión',
      description: 'Ingresa tus credenciales para acceder al sistema',
      email: 'Correo electrónico',
      password: 'Contraseña',
      signIn: 'Iniciar sesión',
      emailAndPasswordRequired: 'El correo y la contraseña son obligatorios.',
      invalidEmailOrPassword: 'Correo o contraseña inválidos.'
    },

    // Common
    common: {
      edit: 'Editar',
      delete: 'Eliminar',
      deactivate: 'Desactivar',
      reactivate: 'Reactivar',
      yes: 'Sí',
      no: 'No',
      actions: 'Acciones',
      confirmDeleteMaterial: '¿Estás seguro de que deseas eliminar este material?',
      confirmDeleteReception: '¿Eliminar esta recepción?',
      invalidId: 'ID inválido',
      update: 'Actualizar',
      editReception: 'Editar recepción',
      editRecipe: 'Editar receta'
    },

    // Navigation & Layout
    nav: {
      receptions: 'Recepciones',
      newReception: 'Nueva recepción',
      materials: 'Materia Primas',
      recipes: 'Recetas',
      appTitle: 'Materia Primas Tracker',
      dashboard: 'Panel',
      logout: 'Cerrar sesión',
      back: 'Volver',
      view: 'Ver',
      filter: 'Filtrar',
      clearFilters: 'Limpiar filtros',
      saveFilterView: 'Guardar vista de filtros',
      viewName: 'Nombre de la vista',
      save: 'Guardar'
    },

    // Recipes Page
    recipes: {
      subtitle: 'Recetas',
      title: 'Recetas',
      addRecipe: 'Agregar receta',
      empty: 'Sin recetas registradas.',
      stats: {
        total: 'Total',
        active: 'Activas',
        inactive: 'Inactivas'
      },
      table: {
        name: 'Nombre',
        category: 'Categoría',
        yieldQty: 'Rendimiento esperado',
        ingredientCount: 'Ingredientes',
        status: 'Estado',
        active: 'Activa',
        inactive: 'Inactiva'
      }
    },
    // New Recipe Page
    newRecipe: {
      subtitle: 'Recetas',
      title: 'Nueva receta',
      formTitle: 'Datos de la receta',
      formDescription: 'Define el nombre, categoría y rendimiento esperado. Agrega los ingredientes desde el catálogo de materiales.',
      fields: {
        name: 'Nombre de la receta',
        namePlaceholder: 'ej. Sopa de pollo',
        category: 'Categoría',
        categoryPlaceholder: 'Sopas, guisos...',
        yieldQuantity: 'Rendimiento esperado',
        yieldUnit: 'Unidad del rendimiento',
        notes: 'Notas',
        active: 'Activa'
      },
      ingredients: {
        title: 'Ingredientes',
        add: 'Agregar ingrediente',
        remove: 'Eliminar',
        material: 'Materia prima',
        materialPlaceholder: 'Buscar materia prima...',
        quantity: 'Cantidad',
        unit: 'Unidad',
        lossPercent: 'Pérdida %',
        notes: 'Notas'
      },
      units: {
        kg: 'kg',
        g: 'g',
        liter: 'L',
        unit: 'unidad',
        box: 'caja'
      },
      buttons: {
        cancel: 'Cancelar',
        save: 'Guardar receta'
      },
      messages: {
        completeFields: 'Completa todos los campos requeridos.',
        invalidYieldQuantity: 'El rendimiento debe ser mayor que cero.',
        invalidUnit: 'Selecciona una unidad válida.',
        atLeastOneIngredient: 'La receta debe tener al menos un ingrediente.',
        selectActiveMaterial: 'Selecciona un materia prima activa para cada ingrediente.',
        duplicateMaterial: 'No se puede agregar el mismo materia prima dos veces.',
        noMaterialsFound: 'No se encontraron materias primas.',
        duplicateName: 'Ya existe una receta con ese nombre.'
      }
    },


    // Home Page
    home: {
      subtitle: 'Prototipo de cocina industrial',
      title: 'Recepción y seguimiento de lotes de materias primas',
      description: 'Registra proveedores, lotes, fechas, cantidades, temperaturas y decisiones de aceptación en un pequeño MVP de SvelteKit.',
      registerReception: 'Registrar recepción',
      viewRecords: 'Ver registros',
      registerNewMaterial: 'Registrar nueva materia prima',
      addToMaterialCatalog: 'Agregar al catálogo de Materia prima',
      createNewRecipe: 'Crear nueva receta con ingredientes',
      latestReceptions: 'Últimas recepciones registradas',
      upcomingExpiries: 'Vencimientos próximos o vencidos',
      noExpiryPending: 'Sin vencimientos pendientes',
      workflowTitle: 'Flujo de trabajo',
      workflow: [
        {
          title: 'Crear materiales',
          description: 'Define nombre, categoría y unidad predeterminada.'
        },
        {
          title: 'Registrar cada lote',
          description: 'Captura proveedor, lote, fechas, cantidad y temperatura.'
        },
        {
          title: 'Buscar y verificar',
          description: 'Revisa vencimiento, estado y datos de trazabilidad.'
        }
      ]
    },

    // Materials Page
    materials: {
      subtitle: 'Catálogo',
      title: 'Materia primas',
      addMaterial: 'Agregar materia prima',
      empty: 'Sin materias primas registradas.',
      deactivatedInstead: 'La materia prima tiene registros existentes y fue <strong>desactivada</strong> en lugar de eliminada.',
      stats: {
        total: 'Total',
        active: 'Activos',
        inactive: 'Inactivos'
      },
      table: {
        name: 'Nombre',
        category: 'Categoría',
        unit: 'Unidad',
        status: 'Estado',
        createdBy: 'Creado por',
        active: 'Activo',
        inactive: 'Inactivo',
        storage: 'Almacenamiento',
        expirationRequired: 'Venc. req.'
      }
    },

    // New Material Page
    newMaterial: {
      subtitle: 'Catálogo',
      title: 'Nueva materia prima',
      formTitle: 'Datos de la materia prima',
      formDescription: 'Comienza con un catálogo simple. Agrega categorías y unidades de manera consistente.',
      fields: {
        name: 'Nombre de la materia prima',
        namePlaceholder: 'ej. Pechuga de pollo',
        category: 'Categoría',
        categoryPlaceholder: 'Carnes, verduras...',
        defaultUnit: 'Unidad predeterminada',
        storageCondition: 'Condición de almacenamiento',
        minStock: 'Stock mínimo',
        expirationRequired: 'Requiere vencimiento',
        active: 'Activo'
      },
      units: {
        kg: 'kg',
        g: 'g',
        liter: 'L',
        unit: 'unidad',
        box: 'caja',
        Bag: 'Paquete',
      },
      buttons: {
        cancel: 'Cancelar',
        save: 'Guardar materia prima'
      },
      storageOptions: {
        refrigerated: 'Refrigerado',
        frozen: 'Congelado',
        dry: 'Seco',
        ambient: 'Ambiente'
      },
      messages: {
        completeFields: 'Completa todos los campos requeridos.',
        invalidUnit: 'Selecciona una unidad válida.',
        minStockNegative: 'El stock mínimo no puede ser negativo.',
        invalidStorageCondition: 'Condición de almacenamiento inválida.'
       }
     },

    // Receipts Page
    receptions: {
      subtitle: 'Trazabilidad',
      title: 'Recepciones',
      newReception: 'Nueva recepción',
      searchPlaceholder: 'Buscar proveedor, lote, materia prima u observación',
      search: 'Buscar',
      empty: 'No se encontraron recepciones.',
      observationDetails: 'Detalle de observación',
      details: 'Detalles',
      hide: 'Ocultar',
      expiringSoon: 'Próximo a vencer',
      expired: 'Vencido',
      nearExpiry: 'Próximo a vencer',
      ok: 'Válido',
      missingExpiration: 'Sin fecha',
      clearFilter: 'Limpiar filtro',
      filters: 'Filtros',
      dateFrom: 'Fecha desde',
      dateTo: 'Fecha hasta',
      allMaterials: 'Todos las materias primas',
      allCategories: 'Todas las categorías',
      allConditions: 'Todas las condiciones',
      all: 'Todos',
      supplierFilter: 'Proveedor / Marca',
      storageCondition: 'Almacenamiento',
      withObservations: 'Con observaciones',
      applyFilters: 'Aplicar',
      resetFilters: 'Reiniciar',
      saveView: 'Guardar vista',
      viewName: 'Nombre de la vista',
      viewNamePlaceholder: 'ej. Mi filtro',
      viewNameRequired: 'El nombre de la vista es obligatorio.',
      exportCsv: 'Exportar CSV',
      print: 'Imprimir',
      exportFiltered: 'Exportar filtrados',
      exportAll: 'Exportar todos',
      truncatedNotice: 'Se muestran los 100 registros más recientes.',
      table: {
        date: 'Fecha',
        material: 'Materia prima',
        category: 'Categoría',
        supplier: 'Proveedor / Marca',
        lot: 'Lote',
        expiry: 'Vencimiento',
        quantity: 'Cantidad',
        temp: 'Temp.',
        status: 'Estado',
        observations: 'Observaciones',
        createdBy: 'Creado por',
        storage: 'Almacenamiento',
        expirationRequired: 'Venc. req.'
      }
    },
    mobileReception: {
      quickObservations: 'Observaciones rápidas',
      obsNone: 'Sin observación',
      obsPackaging: 'Problema de empaque',
      obsTemperature: 'Problema de temperatura',
      obsLabel: 'Problema de etiquetado',
      obsMissingDoc: 'Documentación faltante',
      recentReceptions: 'Recepciones recientes',
      truncatedNotice: 'Mostrando solo las 100 recepciones más recientes.'
    },
    reception: {
      title: 'Recepciones',
      receptionDate: 'Fecha de recepción',
      date: 'Fecha',
      supplier: 'Proveedor / marca',
      supplierName: 'Nombre del proveedor / marca',
      material: 'Materia prima',
      selectMaterial: 'Seleccionar materia prima',
      noMaterial: '-- Seleccionar --',
      lot: 'Lote',
      lotCode: 'Código de lote',
      quantity: 'Cantidad',
      amount: 'Cantidad',
      unit: 'Unidad',
      unitSingular: 'unidad',
      box: 'caja',
      bag: 'Paquete',
      pallet: 'pallet',
      dates: 'Fechas',
      manufactureDate: 'Fecha de fabricación',
      expirationDate: 'Fecha de vencimiento',
      storageConditions: 'Condiciones de almacenamiento',
      storageCondition: 'Condición',
      ambient: 'Ambiente',
      refrigerated: 'Refrigerado',
      frozen: 'Congelado',
      temperature: 'Temperatura',
      observations: 'Observaciones',
      observationsPlaceholder: 'Embalaje, condición organoléptica, acción correctiva...',
      expiringSoon: 'Próximo a vencer',
      search: 'Buscar',
      searchPlaceholder: 'Buscar...',
      dateFrom: 'Fecha desde',
      dateTo: 'Fecha hasta',
      allMaterials: 'Todos las materias primas',
      category: 'Categoría',
      allCategories: 'Todas las categorías',
      allConditions: 'Todas las condiciones',
      expirationStatus: 'Estado de vencimiento',
      all: 'Todos',
      expired: 'Vencido',
      nearExpiry: 'Próximo a vencer',
      ok: 'Válido',
      missingExpiration: 'Sin fecha',
      withObservations: 'Con observaciones',
      filter: 'Filtrar',
      clearFilters: 'Limpiar filtros',
      receptionSingular: 'recepción',
      receptionPlural: 'recepciones',
      noReceptionsFound: 'No se encontraron recepciones',
      expiration: 'Vencimiento',
      actions: 'Acciones',
      view: 'Ver',
      saveFilterView: 'Guardar vista de filtros',
      viewName: 'Nombre de la vista',
      save: 'Guardar',
      back: 'Volver',
      reset: 'Reiniciar'
    },

    // New Reception Page
    newReception: {
      subtitle: 'Control de recepción',
      title: 'Registrar materia prima',
      formTitle: 'Registro de recepción',
      formDescription: 'Captura suficientes datos para apoyar la rotación FEFO y la trazabilidad del proveedor.',
      fields: {
        receivedOn: 'Fecha de recepción',
        material: 'Materia prima',
        materialPlaceholder: 'Busca materia prima por nombre, categoría o unidad...',
        supplier: 'Proveedor',
        lotCode: 'Código de lote',
        manufactureDate: 'Fecha de fabricación',
        expiryDate: 'Fecha de vencimiento',
        quantity: 'Cantidad',
        unit: 'Unidad',
        temperatureC: 'Temperatura (°C)',
        status: 'Decisión',
        observations: 'Observaciones',
        observationsPlaceholder: 'Embalaje, condición organoléptica, acción correctiva...'
      },
      units: {
        kg: 'kg',
        g: 'g',
        liter: 'L',
        unit: 'unidad',
        box: 'caja',
        bag: 'Paquete',
        pallet: 'pallet'        
      },
      statusOptions: {
        accepted: 'Aceptado',
        conditional: 'Condicional',
        rejected: 'Rechazado'
      },
      buttons: {
        cancel: 'Cancelar',
        save: 'Guardar recepción'
      },
      messages: {
        completeFields: 'Completa los campos requeridos e ingresa una cantidad válida.',
        invalidReceptionDate: 'La fecha de recepción no es válida.',
        invalidManufactureDate: 'La fecha de fabricación no es válida.',
        invalidExpiryDate: 'La fecha de vencimiento no es válida.',
        invalidUnit: 'Selecciona una unidad válida.',
        invalidStatus: 'Selecciona una decisión válida.',
        selectActiveMaterial: 'Selecciona una materia prima activa.',
        invalidTemperature: 'La temperatura debe ser numérica.',
        expiryBeforeManufacture: 'El vencimiento no puede ser anterior a la fecha de fabricación.',
        expiryRequired: 'La fecha de vencimiento es obligatoria para esta materia prima.',
        selectMaterial: 'Selecciona una materia prima de la lista de búsqueda antes de guardar.',
        noMaterials: 'Crea al menos una materia prima antes de registrar una recepción.',
        noMaterialsFound: 'No se encontraron materias primas.'
      },
      receptionSingular: 'recepción',
      receptionPlural: 'recepciones',
      expired: 'Vencido',
      nearExpiry: 'Próximo a vencer',
      ok: 'Válido',
      missingExpiration: 'Sin fecha'
    },

    // Production Batch keys
    productionBatch: {
      messages: {
        selectRecipe: 'Selecciona una receta.',
        validPlannedYield: 'Ingresa un rendimiento planificado válido.',
        validYieldUnit: 'Selecciona una unidad de rendimiento válida.',
        atLeastOneIngredientWithLots: 'Al menos un ingrediente con lotes es requerido.'
      },
      errors: {
        notFound: 'Lote de producción no encontrado.',
        invalidStatus: 'Estado de lote inválido.',
        invalidTransition: 'No se puede cambiar el estado de $1 a $2.',
        unexpected: 'Ocurrió un error inesperado. Intenta nuevamente.'
      }
    },
    errors: {
      unexpected: 'Ocurrió un error inesperado. Intenta nuevamente.',
      forbidden: 'No tenés permisos para realizar esta acción.'
    }
  },
  'es-AR': {
    dailyUse, workspace, simpleRecipe, dashboardView,
    // Login Page
    login: {
      title: 'Iniciar sesión',
      description: 'Ingresa tus credenciales para acceder al sistema',
      email: 'Correo electrónico',
      password: 'Contraseña',
      signIn: 'Iniciar sesión',
      emailAndPasswordRequired: 'El correo y la contraseña son obligatorios.',
      invalidEmailOrPassword: 'Correo o contraseña inválidos.'
    },

    // Common
    common: {
      edit: 'Editar',
      delete: 'Eliminar',
      deactivate: 'Desactivar',
      reactivate: 'Reactivar',
      yes: 'Sí',
      no: 'No',
      actions: 'Acciones',
      confirmDeleteMaterial: '¿Estás seguro de que deseas eliminar esta materia prima?',
      confirmDeleteReception: '¿Eliminar esta recepción?',
      invalidId: 'ID inválido',
      update: 'Actualizar',
      editReception: 'Editar recepción',
      editRecipe: 'Editar receta'
    },

    // Navigation & Layout
    nav: {
      receptions: 'Recepciones',
      newReception: 'Nueva recepción',
      materials: 'Materia Primas',
      recipes: 'Recetas',
      appTitle: 'Materia Primas Tracker',
      dashboard: 'Panel',
      logout: 'Cerrar sesión',
      back: 'Volver',
      view: 'Ver',
      filter: 'Filtrar',
      clearFilters: 'Limpiar filtros',
      saveFilterView: 'Guardar vista de filtros',
      viewName: 'Nombre de la vista',
      save: 'Guardar'
    },

    // Recipes Page
    recipes: {
      subtitle: 'Recetas',
      title: 'Recetas',
      addRecipe: 'Agregar receta',
      empty: 'Sin recetas registradas.',
      stats: {
        total: 'Total',
        active: 'Activas',
        inactive: 'Inactivas'
      },
      table: {
        name: 'Nombre',
        category: 'Categoría',
        yieldQty: 'Rendimiento esperado',
        ingredientCount: 'Ingredientes',
        status: 'Estado',
        active: 'Activa',
        inactive: 'Inactiva'
      }
    },

    // New Recipe Page
    newRecipe: {
      subtitle: 'Recetas',
      title: 'Nueva receta',
      formTitle: 'Datos de la receta',
      formDescription: 'Define el nombre, categoría y rendimiento esperado. Agrega los ingredientes desde el catálogo de materias primas.',
      fields: {
        name: 'Nombre de la receta',
        namePlaceholder: 'ej. Sopa de pollo',
        category: 'Categoría',
        categoryPlaceholder: 'Sopas, guisos...',
        yieldQuantity: 'Rendimiento esperado',
        yieldUnit: 'Unidad del rendimiento',
        notes: 'Notas',
        active: 'Activa'
      },
      ingredients: {
        title: 'Ingredientes',
        add: 'Agregar ingrediente',
        remove: 'Eliminar',
        material: 'Materia prima',
        materialPlaceholder: 'Buscar materia prima...',
        quantity: 'Cantidad',
        unit: 'Unidad',
        lossPercent: 'Pérdida %',
        notes: 'Notas'
      },
      units: {
        kg: 'kg',
        g: 'g',
        liter: 'L',
        unit: 'unidad',
        box: 'caja',
        bag: 'Paquete',
      },
      buttons: {
        cancel: 'Cancelar',
        save: 'Guardar receta'
      },
      messages: {
        completeFields: 'Completa todos los campos requeridos.',
        invalidYieldQuantity: 'El rendimiento debe ser mayor que cero.',
        invalidUnit: 'Selecciona una unidad válida.',
        atLeastOneIngredient: 'La receta debe tener al menos un ingrediente.',
        selectActiveMaterial: 'Selecciona una materia prima activa para cada ingrediente.',
        duplicateMaterial: 'No se puede agregar la misma materia prima dos veces.',
        noMaterialsFound: 'No se encontraron materias primas.',
        duplicateName: 'Ya existe una receta con ese nombre.'
      }
    },


    // Home Page
    home: {
      subtitle: 'Prototipo de cocina industrial',
      title: 'Recepción y seguimiento de lotes de materias primas',
      description: 'Registra proveedores, lotes, fechas, cantidades, temperaturas y decisiones de aceptación en un pequeño MVP de SvelteKit.',
      registerReception: 'Registrar recepción',
      viewRecords: 'Ver registros',
      registerNewMaterial: 'Registrar nueva materia prima',
      addToMaterialCatalog: 'Agregar al catálogo de materias primas',
      createNewRecipe: 'Crear nueva receta con ingredientes',
      latestReceptions: 'Últimas recepciones registradas',
      upcomingExpiries: 'Vencimientos próximos o vencidos',
      noExpiryPending: 'Sin vencimientos pendientes',
      workflowTitle: 'Flujo de trabajo',
      workflow: [
        {
          title: 'Crear materias primas',
          description: 'Define nombre, categoría y unidad predeterminada.'
        },
        {
          title: 'Registrar cada lote',
          description: 'Captura proveedor, lote, fechas, cantidad y temperatura.'
        },
        {
          title: 'Buscar y verificar',
          description: 'Revisa vencimiento, estado y datos de trazabilidad.'
        }
      ]
    },

    // Materials Page
    materials: {
      subtitle: 'Catálogo',
      title: 'Materias Primas',
      addMaterial: 'Agregar materia prima',
      empty: 'Sin materias primas registradas.',
      deactivatedInstead: 'La materia prima tiene registros existentes y fue <strong>desactivada</strong> en lugar de eliminada.',
      stats: {
        total: 'Total',
        active: 'Activos',
        inactive: 'Inactivos'
      },
      table: {
        name: 'Nombre',
        category: 'Categoría',
        unit: 'Unidad',
        status: 'Estado',
        createdBy: 'Creado por',
        active: 'Activo',
        inactive: 'Inactivo',
        storage: 'Almacenamiento',
        expirationRequired: 'Venc. req.'
      }
    },

    // New Material Page
    newMaterial: {
      subtitle: 'Catálogo',
      title: 'Nueva materia prima',
      formTitle: 'Datos de la materia prima',
      formDescription: 'Comienza con un catálogo simple. Agrega categorías y unidades de manera consistente.',
      fields: {
        name: 'Nombre de la materia prima',
        namePlaceholder: 'ej. Pechuga de pollo',
        category: 'Categoría',
        categoryPlaceholder: 'Carnes, verduras...',
        defaultUnit: 'Unidad predeterminada',
        storageCondition: 'Condición de almacenamiento',
        minStock: 'Stock mínimo',
        expirationRequired: 'Requiere vencimiento',
        active: 'Activo'
      },
      units: {
        kg: 'kg',
        g: 'g',
        liter: 'L',
        unit: 'unidad',
        box: 'caja',
        bag: 'Paquete',
      },
      buttons: {
        cancel: 'Cancelar',
        save: 'Guardar materia prima'
      },
      storageOptions: {
        refrigerated: 'Refrigerado',
        frozen: 'Congelado',
        dry: 'Seco',
        ambient: 'Ambiente'
      },
      messages: {
        completeFields: 'Completa todos los campos requeridos.',
        invalidUnit: 'Selecciona una unidad válida.',
        minStockNegative: 'El stock mínimo no puede ser negativo.',
        invalidStorageCondition: 'Condición de almacenamiento inválida.'
       }
     },

    // Receipts Page
    receptions: {
      subtitle: 'Trazabilidad',
      title: 'Recepciones',
      newReception: 'Nueva recepción',
      searchPlaceholder: 'Buscar proveedor, lote, material u observación',
      search: 'Buscar',
      empty: 'No se encontraron recepciones.',
      observationDetails: 'Detalle de observación',
      details: 'Detalles',
      hide: 'Ocultar',
      expiringSoon: 'Próximo a vencer',
      expired: 'Vencido',
      nearExpiry: 'Próximo a vencer',
      ok: 'Válido',
      missingExpiration: 'Sin fecha',
      clearFilter: 'Limpiar filtro',
      filters: 'Filtros',
      dateFrom: 'Fecha desde',
      dateTo: 'Fecha hasta',
      allMaterials: 'Todos los material primas',
      allCategories: 'Todas las categorías',
      allConditions: 'Todas las condiciones',
      all: 'Todos',
      supplierFilter: 'Proveedor / Marca',
      storageCondition: 'Almacenamiento',
      withObservations: 'Con observaciones',
      applyFilters: 'Aplicar',
      resetFilters: 'Reiniciar',
      saveView: 'Guardar vista',
      viewName: 'Nombre de la vista',
        viewNamePlaceholder: 'ej. Mi filtro',
      viewNameRequired: 'El nombre de la vista es obligatorio.',
      exportCsv: 'Exportar CSV',
      print: 'Imprimir',
      exportFiltered: 'Exportar filtrados',
      exportAll: 'Exportar todos',
      truncatedNotice: 'Se muestran los 100 registros más recientes.',
      table: {
        date: 'Fecha',
        material: 'Materia prima',
        category: 'Categoría',
        supplier: 'Proveedor / marca',
        lot: 'Lote',
        expiry: 'Vencimiento',
        quantity: 'Cantidad',
        temp: 'Temp.',
        status: 'Estado',
        observations: 'Observaciones',
        createdBy: 'Creado por',
        storage: 'Almacenamiento',
        expirationRequired: 'Venc. req.'
      }
    },
    mobileReception: {
      quickObservations: 'Observaciones rápidas',
      obsNone: 'Sin observación',
      obsPackaging: 'Problema de empaque',
      obsTemperature: 'Problema de temperatura',
      obsLabel: 'Problema de etiquetado',
      obsMissingDoc: 'Documentación faltante',
      recentReceptions: 'Recepciones recientes',
      truncatedNotice: 'Mostrando solo las 100 recepciones más recientes.'
    },
    reception: {
      title: 'Recepciones',
      receptionDate: 'Fecha de recepción',
      date: 'Fecha',
      supplier: 'Proveedor',
      supplierName: 'Nombre del proveedor',
      material: 'Materia prima',
      selectMaterial: 'Seleccionar materia prima',
      noMaterial: '-- Seleccionar --',
      lot: 'Lote',
      lotCode: 'Código de lote',
      quantity: 'Cantidad',
      amount: 'Cantidad',
      unit: 'Unidad',
      unitSingular: 'unidad',
      box: 'caja',
      bag: 'bolsa',
      pallet: 'palé',
      dates: 'Fechas',
      manufactureDate: 'Fecha de fabricación',
      expirationDate: 'Fecha de vencimiento',
      storageConditions: 'Condiciones de almacenamiento',
      storageCondition: 'Condición',
      ambient: 'Ambiente',
      refrigerated: 'Refrigerado',
      frozen: 'Congelado',
      temperature: 'Temperatura',
      observations: 'Observaciones',
      observationsPlaceholder: 'Embalaje, condición organoléptica, acción correctiva...',
      expiringSoon: 'Próximo a vencer',
      search: 'Buscar',
      searchPlaceholder: 'Buscar...',
      dateFrom: 'Fecha desde',
      dateTo: 'Fecha hasta',
      allMaterials: 'Todos los materiales',
      category: 'Categoría',
      allCategories: 'Todas las categorías',
      allConditions: 'Todas las condiciones',
      expirationStatus: 'Estado de vencimiento',
      all: 'Todos',
      expired: 'Vencido',
      nearExpiry: 'Próximo a vencer',
      ok: 'Válido',
      missingExpiration: 'Sin fecha',
      withObservations: 'Con observaciones',
      filter: 'Filtrar',
      clearFilters: 'Limpiar filtros',
      receptionSingular: 'recepción',
      receptionPlural: 'recepciones',
      noReceptionsFound: 'No se encontraron recepciones',
      expiration: 'Vencimiento',
      actions: 'Acciones',
      view: 'Ver',
      saveFilterView: 'Guardar vista de filtros',
      viewName: 'Nombre de la vista',
      save: 'Guardar',
      back: 'Volver',
      reset: 'Reiniciar'
    },

    // New Reception Page
    newReception: {
      subtitle: 'Control de recepción',
      title: 'Registrar materia prima',
      formTitle: 'Registro de recepción',
      formDescription: 'Captura suficientes datos para apoyar la rotación FEFO y la trazabilidad del proveedor.',
      fields: {
        receivedOn: 'Fecha de recepción',
        material: 'Materia prima',
        materialPlaceholder: 'Busca materia prima por nombre, categoría o unidad...',
        supplier: 'Proveedor / marca',
        lotCode: 'Código de lote',
        manufactureDate: 'Fecha de Elaboración / envasado',
        expiryDate: 'Fecha de vencimiento',
        quantity: 'Cantidad',
        unit: 'Unidad',
        temperatureC: 'Temperatura (°C)',
        status: 'Decisión',
        observations: 'Observaciones',
        observationsPlaceholder: 'Embalaje, condición organoléptica, acción correctiva...'
      },
      units: {
        kg: 'kg',
        g: 'g',
        liter: 'L',
        unit: 'unidad',
        box: 'caja',
        bag: 'Paquete'
      },
      statusOptions: {
        accepted: 'Aceptado',
        conditional: 'Condicional',
        rejected: 'Rechazado'
      },
      buttons: {
        cancel: 'Cancelar',
        save: 'Guardar recepción'
      },
      messages: {
        completeFields: 'Completa los campos requeridos e ingresa una cantidad válida.',
        invalidReceptionDate: 'La fecha de recepción no es válida.',
        invalidManufactureDate: 'La fecha de elaboración no es válida.',
        invalidExpiryDate: 'La fecha de vencimiento no es válida.',
        invalidUnit: 'Selecciona una unidad válida.',
        invalidStatus: 'Selecciona una decisión válida.',
        selectActiveMaterial: 'Selecciona un materia prima activa.',
        invalidTemperature: 'La temperatura debe ser numérica.',
        expiryBeforeManufacture: 'El vencimiento no puede ser anterior a la fecha de elaboración.',
        expiryRequired: 'La fecha de vencimiento es obligatoria para este material.',
        selectMaterial: 'Selecciona un materia prima de la lista de búsqueda antes de guardar.',
        noMaterials: 'Crea al menos un materia prima antes de registrar una recepción.',
        noMaterialsFound: 'No se encontraron materias primas.'
      },
      receptionSingular: 'recepción',
      receptionPlural: 'recepciones',
      expired: 'Vencido',
      nearExpiry: 'Próximo a vencer',
      ok: 'Válido',
      missingExpiration: 'Sin fecha'
    },

    // Production Batch keys
    productionBatch: {
      messages: {
        selectRecipe: 'Selecciona una receta.',
        validPlannedYield: 'Ingresa un rendimiento planificado válido.',
        validYieldUnit: 'Selecciona una unidad de rendimiento válida.',
        atLeastOneIngredientWithLots: 'Al menos un ingrediente con lotes es requerido.'
      },
      errors: {
        notFound: 'Lote de producción no encontrado.',
        invalidStatus: 'Estado de lote inválido.',
        invalidTransition: 'No se puede cambiar el estado de $1 a $2.',
        unexpected: 'Ocurrió un error inesperado. Intenta nuevamente.'
      }
    },
    errors: {
      unexpected: 'Ocurrió un error inesperado. Intenta nuevamente.',
      forbidden: 'No tenés permisos para realizar esta acción.'
    }
  }
};
