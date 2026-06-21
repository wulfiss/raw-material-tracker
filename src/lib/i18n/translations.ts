export type Language = 'es' | 'es-AR';

export const translations = {
  es: {
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
      materials: 'Materiales',
      recipes: 'Recetas',
      appTitle: 'Raw Material Tracker',
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
        material: 'Material',
        materialPlaceholder: 'Buscar material...',
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
        selectActiveMaterial: 'Selecciona un material activo para cada ingrediente.',
        duplicateMaterial: 'No se puede agregar el mismo material dos veces.',
        noMaterialsFound: 'No se encontraron materiales.'
      }
    },


    // Home Page
    home: {
      subtitle: 'Prototipo de cocina industrial',
      title: 'Recepción y seguimiento de lotes de materias primas',
      description: 'Registra proveedores, lotes, fechas, cantidades, temperaturas y decisiones de aceptación en un pequeño MVP de SvelteKit.',
      registerReception: 'Registrar recepción',
      viewRecords: 'Ver registros',
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
      title: 'Materiales',
      addMaterial: 'Agregar material',
      empty: 'Sin materiales registrados.',
      deactivatedInstead: 'El material tiene registros existentes y fue <strong>desactivado</strong> en lugar de eliminado.',
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
      title: 'Nuevo material',
      formTitle: 'Datos del material',
      formDescription: 'Comienza con un catálogo simple. Agrega categorías y unidades de manera consistente.',
      fields: {
        name: 'Nombre del material',
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
        box: 'caja'
      },
      buttons: {
        cancel: 'Cancelar',
        save: 'Guardar material'
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
          minStockNegative: 'El stock mínimo no puede ser negativo.'
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
      allMaterials: 'Todos los materiales',
      allCategories: 'Todas las categorías',
      allConditions: 'Todas las condiciones',
      all: 'Todos',
      supplierFilter: 'Proveedor',
      storageCondition: 'Almacenamiento',
      withObservations: 'Con observaciones',
      applyFilters: 'Aplicar',
      resetFilters: 'Reiniciar',
      saveView: 'Guardar vista',
      viewName: 'Nombre de la vista',
      viewNamePlaceholder: 'ej. Mi filtro',
      exportCsv: 'Exportar CSV',
      print: 'Imprimir',
      exportFiltered: 'Exportar filtrados',
      exportAll: 'Exportar todos',
      truncatedNotice: 'Se muestran los 100 registros más recientes.',
      table: {
        date: 'Fecha',
        material: 'Material',
        category: 'Categoría',
        supplier: 'Proveedor',
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
      recentReceptions: 'Recepciones recientes'
    },
    reception: {
      title: 'Recepciones',
      receptionDate: 'Fecha de recepción',
      date: 'Fecha',
      supplier: 'Proveedor',
      supplierName: 'Nombre del proveedor',
      material: 'Material',
      selectMaterial: 'Seleccionar material',
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
        material: 'Material',
        materialPlaceholder: 'Busca material por nombre, categoría o unidad...',
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
        box: 'caja'
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
        selectActiveMaterial: 'Selecciona un material activo.',
        invalidTemperature: 'La temperatura debe ser numérica.',
        expiryBeforeManufacture: 'El vencimiento no puede ser anterior a la fecha de fabricación.',
        expiryRequired: 'La fecha de vencimiento es obligatoria para este material.',
        selectMaterial: 'Selecciona un material de la lista de búsqueda antes de guardar.',
        noMaterials: 'Crea al menos un material antes de registrar una recepción.',
        noMaterialsFound: 'No se encontraron materiales.'
      },
      receptionSingular: 'recepción',
      receptionPlural: 'recepciones',
      expired: 'Vencido',
      nearExpiry: 'Próximo a vencer',
      ok: 'Válido',
      missingExpiration: 'Sin fecha'
    },
  },
  'es-AR': {
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
      materials: 'Materiales',
      recipes: 'Recetas',
      appTitle: 'Raw Material Tracker',
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
        material: 'Material',
        materialPlaceholder: 'Buscar material...',
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
        selectActiveMaterial: 'Selecciona un material activo para cada ingrediente.',
        duplicateMaterial: 'No se puede agregar el mismo material dos veces.',
        noMaterialsFound: 'No se encontraron materiales.'
      }
    },


    // Home Page
    home: {
      subtitle: 'Prototipo de cocina industrial',
      title: 'Recepción y seguimiento de lotes de materias primas',
      description: 'Registra proveedores, lotes, fechas, cantidades, temperaturas y decisiones de aceptación en un pequeño MVP de SvelteKit.',
      registerReception: 'Registrar recepción',
      viewRecords: 'Ver registros',
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
      title: 'Materiales',
      addMaterial: 'Agregar material',
      empty: 'Sin materiales registrados.',
      deactivatedInstead: 'El material tiene registros existentes y fue <strong>desactivado</strong> en lugar de eliminado.',
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
      title: 'Nuevo material',
      formTitle: 'Datos del material',
      formDescription: 'Comienza con un catálogo simple. Agrega categorías y unidades de manera consistente.',
      fields: {
        name: 'Nombre del material',
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
        box: 'caja'
      },
      buttons: {
        cancel: 'Cancelar',
        save: 'Guardar material'
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
          minStockNegative: 'El stock mínimo no puede ser negativo.'
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
      allMaterials: 'Todos los materiales',
      allCategories: 'Todas las categorías',
      allConditions: 'Todas las condiciones',
      all: 'Todos',
      supplierFilter: 'Proveedor',
      storageCondition: 'Almacenamiento',
      withObservations: 'Con observaciones',
      applyFilters: 'Aplicar',
      resetFilters: 'Reiniciar',
      saveView: 'Guardar vista',
      viewName: 'Nombre de la vista',
      viewNamePlaceholder: 'ej. Mi filtro',
      exportCsv: 'Exportar CSV',
      print: 'Imprimir',
      exportFiltered: 'Exportar filtrados',
      exportAll: 'Exportar todos',
      truncatedNotice: 'Se muestran los 100 registros más recientes.',
      table: {
        date: 'Fecha',
        material: 'Material',
        category: 'Categoría',
        supplier: 'Proveedor',
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
      recentReceptions: 'Recepciones recientes'
    },
    reception: {
      title: 'Recepciones',
      receptionDate: 'Fecha de recepción',
      date: 'Fecha',
      supplier: 'Proveedor',
      supplierName: 'Nombre del proveedor',
      material: 'Material',
      selectMaterial: 'Seleccionar material',
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
        material: 'Material',
        materialPlaceholder: 'Busca material por nombre, categoría o unidad...',
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
        box: 'caja'
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
        selectActiveMaterial: 'Selecciona un material activo.',
        invalidTemperature: 'La temperatura debe ser numérica.',
        expiryBeforeManufacture: 'El vencimiento no puede ser anterior a la fecha de fabricación.',
        expiryRequired: 'La fecha de vencimiento es obligatoria para este material.',
        selectMaterial: 'Selecciona un material de la lista de búsqueda antes de guardar.',
        noMaterials: 'Crea al menos un material antes de registrar una recepción.',
        noMaterialsFound: 'No se encontraron materiales.'
      },
      receptionSingular: 'recepción',
      receptionPlural: 'recepciones',
      expired: 'Vencido',
      nearExpiry: 'Próximo a vencer',
      ok: 'Válido',
      missingExpiration: 'Sin fecha'
    },
  }
};
