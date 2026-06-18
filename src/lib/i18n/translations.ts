export const translations = {
  en: {
    // Login Page
    login: {
      title: 'Sign in',
      description: 'Enter your credentials to access the system',
      email: 'Email',
      password: 'Password',
      signIn: 'Sign in'
    },

    // Navigation & Layout
    nav: {
      receptions: 'Receptions',
      newReception: 'New reception',
      materials: 'Materials',
      appTitle: 'Raw Material Tracker',
      back: 'Back',
      view: 'View',
      filter: 'Filter',
      clearFilters: 'Clear filters',
      saveFilterView: 'Save current filter view',
      viewName: 'View name',
      save: 'Save'
    },

    // Home Page
    home: {
      subtitle: 'Industrial kitchen prototype',
      title: 'Raw-material reception and lot tracking',
      description: 'Register suppliers, lots, dates, quantities, temperatures and acceptance decisions in one small SvelteKit MVP.',
      registerReception: 'Register reception',
      viewRecords: 'View records',
      workflowTitle: 'Workflow',
      workflow: [
        {
          title: 'Create materials',
          description: 'Define name, category and default unit.'
        },
        {
          title: 'Register each lot',
          description: 'Capture supplier, lot, dates, quantity and temperature.'
        },
        {
          title: 'Search and verify',
          description: 'Review expiry, status and traceability data.'
        }
      ]
    },

    // Materials Page
    materials: {
      subtitle: 'Catalogue',
      title: 'Materials',
      addMaterial: 'Add material',
      empty: 'No materials registered.',
      table: {
        name: 'Name',
        category: 'Category',
        unit: 'Unit',
        status: 'Status',
        createdBy: 'Created by',
        active: 'Active',
        inactive: 'Inactive'
      }
    },

    // New Material Page
    newMaterial: {
      subtitle: 'Catalogue',
      title: 'New material',
      formTitle: 'Material data',
      formDescription: 'Use a simple catalogue first. Add categories and units consistently.',
      fields: {
        name: 'Material name',
        namePlaceholder: 'e.g. Chicken breast',
        category: 'Category',
        categoryPlaceholder: 'Meat, vegetables...',
        defaultUnit: 'Default unit'
      },
      units: {
        kg: 'kg',
        g: 'g',
        l: 'L',
        unit: 'unit',
        box: 'box'
      },
      buttons: {
        cancel: 'Cancel',
        save: 'Save material'
      },
      messages: {
        completeFields: 'Complete all required fields.',
        invalidUnit: 'Select a valid unit.'
      }
    },

    // Receipts Page
    receipts: {
      subtitle: 'Traceability',
      title: 'Receptions',
      newReception: 'New reception',
      searchPlaceholder: 'Search supplier, lot, material or observation',
      search: 'Search',
      empty: 'No receptions found.',
      observationDetails: 'Observation details',
      details: 'Details',
      hide: 'Hide',
      expiringSoon: 'Expiring soon',
      table: {
        date: 'Date',
        material: 'Material',
        supplier: 'Supplier',
        lot: 'Lot',
        expiry: 'Expiry',
        quantity: 'Quantity',
        temp: 'Temp.',
        status: 'Status',
        observations: 'Observations',
        createdBy: 'Created by'
      }
    },

  // New Reception Page
    newReception: {
      subtitle: 'Reception control',
      title: 'Register raw material',
      formTitle: 'Reception record',
      formDescription: 'Capture enough data to support FEFO rotation and supplier traceability.',
      fields: {
        receivedOn: 'Reception date',
        material: 'Material',
        materialPlaceholder: 'Search material by name, category or unit...',
        supplier: 'Supplier',
        lotCode: 'Lot code',
        manufactureDate: 'Manufacture date',
        expiryDate: 'Expiry date',
        quantity: 'Quantity',
        unit: 'Unit',
        temperatureC: 'Temperature (°C)',
        status: 'Decision',
        observations: 'Observations',
        observationsPlaceholder: 'Packaging, organoleptic condition, corrective action...'
      },
      units: {
        kg: 'kg',
        g: 'g',
        l: 'L',
        unit: 'unit',
        box: 'box'
      },
      statusOptions: {
        accepted: 'Accepted',
        conditional: 'Conditional',
        rejected: 'Rejected'
      },
      buttons: {
        cancel: 'Cancel',
        save: 'Save reception'
      },
      messages: {
        completeFields: 'Complete the required fields and enter a valid quantity.',
        invalidReceptionDate: 'Reception date is invalid.',
        invalidManufactureDate: 'Manufacture date is invalid.',
        invalidExpiryDate: 'Expiry date is invalid.',
        invalidUnit: 'Select a valid unit.',
        invalidStatus: 'Select a valid decision.',
        selectActiveMaterial: 'Select an active material.',
        invalidTemperature: 'Temperature must be numeric.',
        expiryBeforeManufacture: 'Expiry cannot be before manufacture date.',
        selectMaterial: 'Select one material from the search list before saving.',
        noMaterials: 'Create at least one material before registering a reception.',
        noMaterialsFound: 'No materials found.'
      },
      receptionSingular: 'reception',
      receptionPlural: 'receptions',
      expired: 'Expired',
      nearExpiry: 'Near expiry',
      ok: 'Valid',
      missingExpiration: 'Missing expiration date'
    },

    reception: {
      title: 'Receptions',
      receptionDate: 'Reception date',
      date: 'Date',
      supplier: 'Supplier',
      supplierName: 'Supplier name',
      material: 'Material',
      selectMaterial: 'Select material',
      noMaterial: '-- Select --',
      lot: 'Lot',
      lotCode: 'Lot code',
      quantity: 'Quantity',
      amount: 'Amount',
      unit: 'Unit',
      unitSingular: 'unit',
      box: 'box',
      bag: 'bag',
      pallet: 'pallet',
      dates: 'Dates',
      manufactureDate: 'Manufacture date',
      expirationDate: 'Expiry date',
      storageConditions: 'Storage conditions',
      storageCondition: 'Condition',
      ambient: 'Ambient',
      refrigerated: 'Refrigerated',
      frozen: 'Frozen',
      temperature: 'Temperature',
      observations: 'Observations',
      observationsPlaceholder: 'Packaging, organoleptic condition, corrective action...',
      expiringSoon: 'Expiring soon',
      search: 'Search',
      searchPlaceholder: 'Search...',
      dateFrom: 'From date',
      dateTo: 'To date',
      allMaterials: 'All materials',
      category: 'Category',
      allCategories: 'All categories',
      allConditions: 'All conditions',
      expirationStatus: 'Expiration status',
      all: 'All',
      expired: 'Expired',
      nearExpiry: 'Near expiry',
      ok: 'Valid',
      missingExpiration: 'Missing',
      withObservations: 'With observations',
      filter: 'Filter',
      clearFilters: 'Clear filters',
      receptionSingular: 'reception',
      receptionPlural: 'receptions',
      noReceptionsFound: 'No receptions found',
      expiration: 'Expiration',
      actions: 'Actions',
      view: 'View',
      saveFilterView: 'Save filter view',
      viewName: 'View name',
      save: 'Save',
      back: 'Back',
      reset: 'Reset'
    }
  },

  'es-AR': {
    // Login Page
    login: {
      title: 'Iniciar sesión',
      description: 'Ingresa tus credenciales para acceder al sistema',
      email: 'Correo electrónico',
      password: 'Contraseña',
      signIn: 'Iniciar sesión'
    },

    // Navigation & Layout
   nav: {
      receptions: 'Receptions',
      newReception: 'New reception',
      materials: 'Materials',
      appTitle: 'Raw Material Tracker',
      back: 'Back',
      view: 'View',
      filter: 'Filter',
      clearFilters: 'Clear filters',
      saveFilterView: 'Save current filter view',
      viewName: 'View name',
      save: 'Save'
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
      table: {
        name: 'Nombre',
        category: 'Categoría',
        unit: 'Unidad',
        status: 'Estado',
        createdBy: 'Creado por',
        active: 'Activo',
        inactive: 'Inactivo'
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
        defaultUnit: 'Unidad predeterminada'
      },
      units: {
        kg: 'kg',
        g: 'g',
        l: 'L',
        unit: 'unidad',
        box: 'caja'
      },
      buttons: {
        cancel: 'Cancelar',
        save: 'Guardar material'
      },
      messages: {
        completeFields: 'Completa todos los campos requeridos.',
        invalidUnit: 'Selecciona una unidad válida.'
      }
    },

  // Receipts Page
    receipts: {
      subtitle: 'Traceability',
      title: 'Receptions',
      newReception: 'New reception',
      searchPlaceholder: 'Search supplier, lot, material or observation',
      search: 'Search',
      empty: 'No receptions found.',
      observationDetails: 'Observation details',
      details: 'Details',
      hide: 'Hide',
      expiringSoon: 'Expiring soon',
      table: {
        date: 'Date',
        material: 'Material',
        supplier: 'Supplier',
        lot: 'Lot',
        expiry: 'Expiry',
        quantity: 'Quantity',
        temp: 'Temp.',
        status: 'Status',
        observations: 'Observations',
        createdBy: 'Created by'
      }
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
        l: 'L',
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
        selectMaterial: 'Selecciona un material de la lista de búsqueda antes de guardar.',
        noMaterials: 'Crea al menos un material antes de registrar una recepción.',
        noMaterialsFound: 'No se encontraron materiales.'
      },
      receptionSingular: 'recepción',
      receptionPlural: 'recepciones',
      expired: 'Expirado',
      nearExpiry: 'Próximo a vencer',
      ok: 'Válido',
      missingExpiration: 'Sin fecha de expiración'
    }
  }
} as const;

export type Language = keyof typeof translations;
