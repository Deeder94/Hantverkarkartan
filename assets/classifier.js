const CATEGORY_DEFS = {
  build: {
    label: 'Bygg & renovering', short: 'BY', icon: '▦', color: '#7c3aed',
    defaultSubcategory: ['general', 'Byggservice & renovering'],
    subcategories: {
      general: {label:'Byggservice & renovering', terms:['general_contractor','building_contractor','construction_contractor','construction_company','construction_service','builder','home_builder','building_company','building_service','renovation','remodeling','home_improvement_contractor','handyman']},
      carpentry: {label:'Snickeri & finsnickeri', terms:['carpenter','carpentry','carpentry_service','joiner','joinery','cabinet_maker','cabinetry','woodworker']},
      roof: {label:'Tak & takservice', terms:['roofing','roofer','roofing_contractor','roof_repair','roof_service']},
      masonry: {label:'Mur, betong & grund', terms:['masonry','mason','bricklayer','concrete_contractor','foundation','foundation_contractor']},
      doors: {label:'Portar, dörrar & fönster', terms:['window_installer','window_service','door_installer','door_service','garage_door','garage_door_service','garage_door_installer','gate_installer','glazier','glass_service','residential_glass']},
      insulation: {label:'Isolering', terms:['insulation','insulation_contractor','insulation_service']},
      kitchenBath: {label:'Kök & badrumsrenovering', terms:['kitchen_remodeler','kitchen_renovation','bathroom_remodeler','bathroom_renovation']},
      deckFence: {label:'Altan, staket & uterum', terms:['deck_builder','fence_contractor','fence_installer','patio_builder','sunroom_contractor']},
      facade: {label:'Fasad, plåt & beslag', terms:['siding_contractor','facade_contractor','facade_service','sheet_metal_contractor','architectural_sheet_metal','metal_cladding_contractor']},
      sunProtection: {label:'Markiser & solskydd', terms:['awning_service','awning_installer','sunshade_installer','exterior_blind_installer']}
    }
  },
  electric: {
    label: 'El & energi', short: 'EL', icon: '⚡', color: '#d97706',
    defaultSubcategory: ['electrician', 'Elinstallation & service'],
    subcategories: {
      electrician: {label:'Elinstallation & service', terms:['electrician','electrician_service','electrical_contractor','electrical_service','electrical_installation','electrical_repair','electrical_wiring']},
      solar: {label:'Solceller & solel', terms:['solar','solar_installer','solar_panel_installer','solar_energy','solar_energy_contractor','photovoltaic_installer']},
      ev: {label:'Laddbox & hemmaladdning', terms:['charging_station_installer','ev_charger_installer','ev_charging_installer','home_ev_charger_installer','charging_point_installer']},
      lighting: {label:'Belysningsinstallation', terms:['lighting_contractor','lighting_service','lighting_installer']},
      backup: {label:'Reservkraft & energi', terms:['generator_service','generator_installer','backup_power_service','energy_service']},
      dataFiber: {label:'Fiber, data & nätverk', terms:['fiber_optic_installer','network_cabling_service','data_cabling','structured_cabling','telecommunications_contractor']}
    }
  },
  plumbing: {
    label: 'VVS, värme & klimat', short: 'VV', icon: '◒', color: '#0284c7',
    defaultSubcategory: ['plumbing', 'VVS & rör'],
    subcategories: {
      plumbing: {label:'VVS & rör', terms:['plumber','plumbing','plumbing_service','plumbing_repair','plumbing_contractor']},
      heating: {label:'Värme & värmepump', terms:['heating_contractor','heating_service','heat_pump','heat_pump_service','heat_pump_installer','boiler_service','water_heater']},
      ventilation: {label:'Ventilation', terms:['ventilation','ventilation_service','ventilation_contractor','air_duct_cleaning']},
      cooling: {label:'Kyla & AC', terms:['air_conditioning','air_conditioning_contractor','air_conditioning_service','refrigeration_service']},
      drain: {label:'Avlopp & avloppsservice', terms:['septic','septic_service','drain_cleaning','drain_service','sewer_service','sewer_contractor']},
      pump: {label:'Pump & vatten', terms:['pump_service','pump_installer','well_pump_service','water_system_service']},
      bathroom: {label:'Badrum & sanitetsinstallation', terms:['bathroom_installer','bathroom_contractor','sanitary_installation','sanitary_service']},
      waterTreatment: {label:'Vattenrening & filter', terms:['water_treatment_service','water_filter_service','water_softener_service','water_purification_service']},
      poolSpa: {label:'Pool & spa-service', terms:['pool_service','pool_contractor','pool_installation','swimming_pool_contractor','spa_service','hot_tub_service']}
    }
  },
  paint: {
    label: 'Målning, golv & ytskikt', short: 'MÅ', icon: '◩', color: '#db2777',
    defaultSubcategory: ['painting', 'Målning & ytskikt'],
    subcategories: {
      painting: {label:'Målning & fasad', terms:['painter','house_painter','interior_painter','exterior_painter','painting_contractor','painting_service','paint_contractor','surface_treatment']},
      paintStore: {label:'Färg & tapet', terms:['paint_store','paint_shop','wallpaper_store','wallpaper','wallpaper_installer','wallpaper_service']},
      floor: {label:'Golv & golvläggning', terms:['flooring','flooring_contractor','flooring_store','floor_sanding','floor_refinishing','floor_refinishing_service','floor_installer']},
      tile: {label:'Kakel & plattsättning', terms:['tile_contractor','tiler','tile_store','tile_installer']},
      plaster: {label:'Puts, gips & spackel', terms:['plasterer','plastering','drywall','drywall_contractor','stucco_contractor']}
    }
  },
  groundTree: {
    label: 'Mark, träd & trädgård', short: 'TR', icon: '♣', color: '#15803d',
    defaultSubcategory: ['ground', 'Mark & utemiljö'],
    subcategories: {
      garden: {label:'Trädgård & skötsel', terms:['landscaper','landscaping','landscape_contractor','garden_service','garden_maintenance','gardener','lawn_service','lawn_care','lawn_care_service']},
      tree: {label:'Träd & arborist', terms:['tree_service','tree_care','tree_removal','tree_trimming','arborist','arborist_service','stump_removal']},
      ground: {label:'Mark, schakt & grundarbete', terms:['excavation','excavation_contractor','excavating_contractor','earthworks','earthmoving','groundwork','land_clearing','grading']},
      paving: {label:'Sten, asfalt & uppfart', terms:['paving_contractor','paving_service','driveway_contractor','stone_paving','asphalt_contractor']},
      drainage: {label:'Dränering', terms:['drainage_contractor','drainage_service','foundation_drainage']},
      snow: {label:'Snöröjning', terms:['snow_removal','snow_plowing','snow_service']}
    }
  },
  locksmith: {
    label: 'Lås, larm & säkerhet', short: 'LÅ', icon: '◆', color: '#475569',
    defaultSubcategory: ['security', 'Säkerhet'],
    subcategories: {
      locks: {label:'Lås & nycklar', terms:['locksmith','locksmith_service','lock_repair','key_cutting','safe_and_vault']},
      alarm: {label:'Larm & brandskydd', terms:['alarm_installer','alarm_system','alarm_service','fire_alarm','fire_alarm_service']},
      access: {label:'Passage & kamera', terms:['security_system','security_system_installer','security_system_service','home_security_service','access_control','access_control_service','surveillance','surveillance_system','camera_security']},
      security: {label:'Bevakning & säkerhet', terms:['security_service','security_company','guard_service']}
    }
  },
  clean: {
    label: 'Städ, sanering & skadedjur', short: 'ST', icon: '✦', color: '#0891b2',
    defaultSubcategory: ['cleaning', 'Städning & lokalvård'],
    subcategories: {
      cleaning: {label:'Städning & lokalvård', terms:['cleaning','cleaner','cleaning_company','cleaning_service','house_cleaning','home_cleaning','residential_cleaning','commercial_cleaning','office_cleaning','building_cleaning','janitorial','janitorial_service','janitorial_services','maid_service','housekeeping_service']},
      windows: {label:'Fönsterputs', terms:['window_cleaning','window_washing']},
      specialist: {label:'Specialstäd & tvätt', terms:['carpet_cleaning','upholstery_cleaning','pressure_washing','gutter_cleaning','gutter_service','pool_cleaning']},
      remediation: {label:'Sanering & skadeservice', terms:['mold_remediation','water_damage_restoration','fire_damage_restoration','restoration_service','sanitation','sewage_cleanup','decontamination']},
      pest: {label:'Skadedjursbekämpning', terms:['pest_control','pest_control_service','exterminator']},
      removal: {label:'Bortforsling & röjning', terms:['waste_removal','junk_removal','rubbish_removal']}
    }
  },
  supplies: {
    label: 'Byggvaror & material', short: 'BV', icon: '▤', color: '#9a3412',
    defaultSubcategory: ['general', 'Bygg & hemmafix'],
    subcategories: {
      general: {label:'Bygg & hemmafix', terms:['home_improvement_store','home_improvement_center','home_improvement_centre','hardware_store','hardware_shop','do_it_yourself_store','diy_store']},
      materials: {label:'Byggvaror & byggmaterial', terms:['building_material','building_material_store','building_supply','building_supply_store','building_material_supplier']},
      timber: {label:'Trä & virke', terms:['lumber','lumber_store','lumber_yard','timber','timber_store','sawmill_store']},
      gardenRetail: {label:'Trädgårdsbutik & utematerial', terms:['garden_center','garden_centre','garden_supply','garden_supply_store','nursery_store','plant_nursery','horticultural_supply']},
      plumbingSupply: {label:'VVS-material', terms:['plumbing_supply','plumbing_supply_store']},
      electricalSupply: {label:'Elmaterial', terms:['electrical_supply','electrical_supply_store']},
      roofingSupply: {label:'Takmaterial', terms:['roofing_supply','roofing_supply_store']},
      stone: {label:'Sten & betong', terms:['stone_supplier','concrete_supplier','masonry_supply']},
      windowsDoors: {label:'Dörrar, fönster & portar', terms:['window_supplier','door_supplier','garage_door_supplier']}
    }
  },
  tools: {
    label: 'Verktyg, maskiner & uthyrning', short: 'VM', icon: '⚒', color: '#78350f',
    defaultSubcategory: ['tools', 'Verktyg & maskiner'],
    subcategories: {
      tools: {label:'Verktyg & maskiner', terms:['tool_store','tool_shop','tool_supplier','power_tool_store','tool_dealer']},
      rental: {label:'Maskin- & verktygsuthyrning', terms:['tool_rental','tool_hire','equipment_rental','equipment_hire','construction_equipment_rental']},
      transportRental: {label:'Släp & transportuthyrning', terms:['trailer_rental','trailer_hire','utility_trailer_rental','moving_trailer_rental']},
      equipment: {label:'Bygg- & entreprenadmaskiner', terms:['construction_equipment','construction_equipment_supplier','heavy_equipment_supplier','machinery_supplier']},
      service: {label:'Maskinservice', terms:['tool_repair','power_tool_repair','machinery_repair','equipment_repair']}
    }
  },
  home: {
    label: 'Hem & inredning', short: 'HE', icon: '⌂', color: '#a21caf',
    defaultSubcategory: ['general', 'Övrigt för hemmet'],
    subcategories: {
      general: {label:'Övrigt för hemmet', terms:['home_goods_store','household_goods_store','home_store','home_furnishings_store']},
      kitchenware: {label:'Kök & husgeråd', terms:['kitchenware_store','housewares_store','household_supply_store','tableware_store','cookware_store','kitchen_goods_store']},
      interior: {label:'Inredning & hembutik', terms:['home_decor_store','interior_design','interior_designer','interior_design_store','home_decor','home_accessories_store']},
      textiles: {label:'Hemtextil & gardiner', terms:['home_textile_store','textile_store','curtain_store','curtain_shop','linen_store','bedding_store']},
      beds: {label:'Sängar & sovrum', terms:['mattress_store','bed_store','bedroom_furniture_store','mattress_shop']},
      rugs: {label:'Mattor & textila golv', terms:['rug_store','carpet_store','rug_shop','carpet_and_rug_store']},
      furniture: {label:'Möbler', terms:['furniture_store','furniture_shop','custom_furniture','furniture_maker']},
      kitchen: {label:'Kök & badrumsbutik', terms:['kitchen_store','kitchen_supply_store','kitchen_showroom','bathroom_supply_store','bathroom_showroom','cabinet_store']},
      lighting: {label:'Lampor & hembelysning', terms:['lighting_store','lighting_shop','lamp_store']},
      blinds: {label:'Gardiner, persienner & solskydd', terms:['blinds_store','blind_store','window_treatment_store','window_covering_store','curtain_and_blind_store']}
    }
  },
  appliances: {
    label: 'Vitvaror & hemteknik', short: 'HT', icon: '◉', color: '#7e22ce',
    defaultSubcategory: ['appliances', 'Vitvaror & hushållsapparater'],
    subcategories: {
      appliances: {label:'Vitvaror & hushållsapparater', terms:['appliance_store','home_appliance_store','household_appliance_store','major_appliance_store','domestic_appliance_store']},
      electronics: {label:'Ljud, bild & hemelektronik', terms:['electronics_store','consumer_electronics_store','audio_store','video_store','home_theater_store','television_store','stereo_store']},
      smartHome: {label:'Smarta hem & nätverk', terms:['smart_home_store','home_automation_store','home_automation_service','smart_home_service','network_installer']},
      repair: {label:'Vitvaru- & hemelektronikservice', terms:['appliance_repair_service','electronics_repair','television_repair','audio_repair']}
    }
  },
  consult: {
    label: 'Konsult, besiktning & projektering', short: 'KO', icon: '◇', color: '#4f46e5',
    defaultSubcategory: ['technical', 'Teknikkonsult & projektering'],
    subcategories: {
      architect: {label:'Arkitekt', terms:['architect','architecture_firm','architectural_service','residential_architect']},
      inspection: {label:'Besiktning & kontroll', terms:['building_inspector','home_inspector','property_inspector','inspection_service','building_inspection']},
      energy: {label:'Energi & energideklaration', terms:['energy_auditor','energy_consultant','energy_assessment','energy_efficiency_consultant']},
      survey: {label:'Mätning & lantmäteri', terms:['surveyor','land_surveyor','surveying_service']},
      structural: {label:'Konstruktion & byggteknik', terms:['structural_engineer','civil_engineer','building_engineer','construction_consultant','building_consultant']},
      technical: {label:'Teknikkonsult & projektering', terms:['engineering_consultant','technical_consultant','engineering_service','project_engineering','project_management_service']}
    }
  },
  firewood: {
    label: 'Ved, eldstad & bränsle', short: 'VE', icon: '▲', color: '#b91c1c',
    defaultSubcategory: ['firewood', 'Ved & bränsle'],
    subcategories: {
      firewood: {label:'Ved & bränsle', terms:['firewood','firewood_supplier','firewood_store','fuel_wood','wood_fuel','wood_fuel_supplier','wood_supplier']},
      pellets: {label:'Pellets', terms:['pellet','pellet_supplier','pellet_store','wood_pellet_supplier','solid_fuel']},
      fireplace: {label:'Eldstad & kamin', terms:['fireplace_store','fireplace_service','wood_stove_store','stove_store','fireplace_installer','wood_stove_installer']},
      chimney: {label:'Skorsten & sotning', terms:['chimney_supply','chimney_sweep','chimney_service','chimney_repair','chimney_installer']}
    }
  }
};

function finalizeCategory(def) {
  const allTerms = [...new Set([
    ...(def.terms || []),
    ...Object.values(def.subcategories || {}).flatMap(s => s.terms || [])
  ])];
  return Object.freeze({...def, terms: allTerms});
}

export const CATEGORIES = Object.freeze(Object.fromEntries(
  Object.entries(CATEGORY_DEFS).map(([key, def]) => [key, finalizeCategory(def)])
));

export function safeJson(value, fallback = null) {
  if (value == null || value === '') return fallback;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

function flattenStrings(value, out = []) {
  if (value == null) return out;
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach(v => flattenStrings(v, out));
  else if (typeof value === 'object') Object.values(value).forEach(v => flattenStrings(v, out));
  return out;
}

function normalizeToken(value) {
  return String(value ?? '')
    .toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '').replace(/_+/g, '_');
}

function normalizeNameText(value) {
  return String(value ?? '')
    .toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' och ').replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function placeName(properties = {}) {
  return String(properties['@name'] || properties.name || properties?.names?.primary || properties['names.primary'] || '');
}

function brandText(properties = {}) {
  const brand = safeJson(properties.brand, {});
  return flattenStrings([
    brand?.names?.primary, brand?.names?.common, brand?.name,
    properties['brand.names.primary'], properties['brand.names.common'], properties.brand_name
  ]).join(' ');
}

function websiteValues(properties = {}) {
  const raw = safeJson(properties.websites, []);
  return Array.isArray(raw) ? raw : (raw ? [raw] : []);
}

function websiteText(properties = {}) {
  return websiteValues(properties).map(v => String(v || '').toLowerCase()).join(' ');
}

function profileContext(properties = {}) {
  return {
    name: normalizeNameText(placeName(properties)),
    brand: normalizeNameText(brandText(properties)),
    websites: websiteText(properties)
  };
}

// High-confidence business profiles. The rules deliberately use exact brands,
// unambiguous trade words, or a matching domain. They are allowed to correct a
// noisy provider taxonomy, which is important for Swedish retail chains and
// descriptive company names.
const PROFILE_RULES = [
  // Home / kitchen / interior
  {key:'home', subcategoryKey:'kitchenware', priority:140, reason:'brand', name:[/\bcervera\b/], domain:[/cervera\.se/]},
  {key:'home', subcategoryKey:'textiles', priority:140, reason:'brand', name:[/\bhemtex\b/], domain:[/hemtex\.se/]},
  {key:'home', subcategoryKey:'beds', priority:140, reason:'brand', name:[/\bsangjatten\b/,/\bkungsangen\b/,/\bsangfabriken\b/], domain:[/kungsangen\.com/,/sangfabriken\.se/]},
  {key:'home', subcategoryKey:'furniture', priority:135, reason:'brand', name:[/\bmio\b/,/\bikea\b/,/\bjysk\b/]},
  {key:'home', subcategoryKey:'kitchen', priority:135, reason:'brand', name:[/\bmarbodal\b/,/\bkvik\b/,/\bvedum\b/,/\bhth\b/]},
  {key:'home', subcategoryKey:'interior', priority:132, reason:'brand', name:[/\bwidedals\b/,/\bvackert hemma\b/]},
  {key:'home', subcategoryKey:'interior', priority:138, reason:'brand', name:[/\blagerhaus\b/]},
  {key:'home', subcategoryKey:'beds', priority:140, reason:'brand', name:[/\bsova\b/]},
  {key:'home', subcategoryKey:'furniture', priority:138, reason:'brand', name:[/\bsvenska hem\b/,/\bem home\b/]},
  {key:'home', subcategoryKey:'kitchen', priority:140, reason:'brand', name:[/\bballingslov\b/,/\bnoblessa\b/,/\bpuustelli\b/]},
  {key:'home', subcategoryKey:'kitchenware', priority:110, reason:'name', name:[/\bhusgerad\b/,/\bkokstillbehor\b/,/\bkokredskap\b/,/\bporslin\b/,/\bbosattning\b/]},
  {key:'home', subcategoryKey:'beds', priority:112, reason:'name', name:[/\bsang(?:ar|butik|studio|specialist|jatten)?\b/,/\bmadrass(?:er|butik)?\b/,/\bsovrum\b/]},
  {key:'home', subcategoryKey:'rugs', priority:112, reason:'name', name:[/\bakta mattor\b/,/\bmattbutik\b/,/\bmattor\b/,/\brug store\b/]},
  {key:'home', subcategoryKey:'textiles', priority:105, reason:'name', name:[/\bhemtextil\b/,/\bgardiner?\b/,/\binredningstextil\b/]},
  {key:'home', subcategoryKey:'furniture', priority:105, reason:'name', name:[/\bmobler\b/,/\bmobelaffar\b/,/\bmobelbutik\b/]},
  {key:'home', subcategoryKey:'interior', priority:102, reason:'name', name:[/\binredning\b/,/\binterior(?: design)?\b/,/\bheminredning\b/]},

  // Appliances / home tech
  {key:'appliances', subcategoryKey:'electronics', priority:145, reason:'brand', name:[/\belon ljud och bild\b/,/\bbon ljud och bild\b/,/\bljud och bild\b/]},
  {key:'appliances', subcategoryKey:'appliances', priority:138, reason:'brand', name:[/\belon\b/], domain:[/elon\.se/]},
  {key:'appliances', subcategoryKey:'electronics', priority:140, reason:'brand', name:[/\belgiganten\b/,/\beuronics\b/]},
  {key:'appliances', subcategoryKey:'appliances', priority:138, reason:'brand', name:[/\belectrolux home\b/]},
  {key:'appliances', subcategoryKey:'electronics', priority:110, reason:'name', name:[/\bhemmelektronik\b/,/\bhemmabio\b/,/\bljud och bild\b/,/\baudio video\b/]},
  {key:'appliances', subcategoryKey:'appliances', priority:108, reason:'name', name:[/\bvitvaror\b/,/\bvitvarubutik\b/,/\bhushallsapparater\b/]},
  {key:'appliances', subcategoryKey:'repair', priority:115, reason:'name', name:[/\bvitvaruservice\b/,/\bvitvarureparation\b/,/\btv service\b/,/\belektronikservice\b/]},

  // Building supplies / DIY retail
  {key:'supplies', subcategoryKey:'general', priority:145, reason:'brand', name:[/\bclas ohlson\b/], domain:[/clasohlson\.com/]},
  {key:'supplies', subcategoryKey:'general', priority:145, reason:'brand', name:[/\bjem och fix\b/,/\bjem fix\b/], domain:[/jemfix\.se/]},
  {key:'supplies', subcategoryKey:'general', priority:140, reason:'brand', name:[/\bjula\b/,/\bbiltema\b/,/^rusta(?:\s+(?:ab|varuhus))?$/], domain:[/(?:^|\.)rusta\.com(?:$|\/)/,/(?:^|\.)rusta\.se(?:$|\/)/]},
  {key:'supplies', subcategoryKey:'materials', priority:140, reason:'brand', name:[/\bbauhaus\b/,/\bhornbach\b/,/\bbyggmax\b/,/\bbeijer\b/,/\bk rauta\b/,/\boptimera\b/,/\bxl bygg\b/,/\bwoody\b/,/\bbolist\b/]},
  {key:'supplies', subcategoryKey:'materials', priority:140, reason:'brand', name:[/\bderome\b/]},
  {key:'supplies', subcategoryKey:'gardenRetail', priority:138, reason:'brand', name:[/\bblomsterlandet\b/]},
  {key:'supplies', subcategoryKey:'gardenRetail', priority:140, reason:'brand', name:[/\bplantagen\b/,/\bgranngarden\b/], domain:[/plantagen\./,/granngarden\.se/]},
  {key:'supplies', subcategoryKey:'general', priority:118, reason:'name', name:[/\bjarnhandel\b/,/\bbyggmarknad\b/,/\bbyggvaruhus\b/,/\bhemmafix\b/,/\bbygg hem och tradgard\b/]},
  {key:'supplies', subcategoryKey:'materials', priority:112, reason:'name', name:[/\bbyggmaterial\b/,/\bbyggvaror\b/,/\bbygghandel\b/]},
  {key:'supplies', subcategoryKey:'timber', priority:112, reason:'name', name:[/\bbradgard\b/,/\bvirkeshandel\b/,/\bsag och byggmaterial\b/]},
  {key:'supplies', subcategoryKey:'gardenRetail', priority:112, reason:'name', name:[/\bhandelstradgard\b/,/\bplantskola\b/,/\btradgardsbutik\b/]},

  // Tools / rental
  {key:'tools', subcategoryKey:'rental', priority:140, reason:'brand', name:[/\bcramo\b/,/\bramirent\b/,/\brenta\b/,/\blambertsson\b/,/\bstavdal\b/]},
  {key:'tools', subcategoryKey:'transportRental', priority:145, reason:'brand', name:[/\bfreetrailer\b/], domain:[/freetrailer\./]},
  {key:'tools', subcategoryKey:'transportRental', priority:120, reason:'name', name:[/\bslaputhyrning\b/,/\bslapvagnsuthyrning\b/,/\btraileruthyrning\b/]},
  {key:'tools', subcategoryKey:'rental', priority:112, reason:'name', name:[/\bmaskinuthyrning\b/,/\bverktygsuthyrning\b/,/\bbyggmaskinuthyrning\b/]},
  {key:'tools', subcategoryKey:'tools', priority:108, reason:'name', name:[/\bverktygsbutik\b/,/\bverktygshandel\b/,/\bmaskinhandel\b/]},

  // Electrical / plumbing / other services
  {key:'electric', subcategoryKey:'electrician', priority:125, reason:'name', name:[/\belektriska\b/,/\belektriker\b/,/\beltjanst\b/,/\belservice\b/,/\belinstallation(?:er)?\b/,/\belmontage\b/,/\belteknik\b/,/\belkraft\b/,/\belektroservice\b/]},
  {key:'electric', subcategoryKey:'solar', priority:140, reason:'brand', name:[/\bsvea solar\b/,/\bsesol\b/,/\b1komma5\b/]},
  {key:'electric', subcategoryKey:'solar', priority:120, reason:'name', name:[/\bsolcell(?:er|sservice)?\b/,/\bsolar installer\b/]},
  {key:'electric', subcategoryKey:'ev', priority:120, reason:'name', name:[/\bladdbox(?:ar|installation)?\b/,/\bhemmaladd(?:ning)?\b/]},
  {key:'plumbing', subcategoryKey:'plumbing', priority:120, reason:'name', name:[/\bvvs\b/,/\brormokar(?:e|en)?\b/,/\brorservice\b/,/\brorteknik\b/,/\bplumb(?:er|ing)\b/]},
  {key:'plumbing', subcategoryKey:'heating', priority:120, reason:'name', name:[/\bvarmepump(?:ar|service)?\b/]},
  {key:'plumbing', subcategoryKey:'ventilation', priority:120, reason:'name', name:[/\bventilation(?:sservice)?\b/]},

  // Paint / floors
  {key:'paint', subcategoryKey:'paintStore', priority:140, reason:'brand', name:[/\bflugger\b/,/\bnordsjo\b/,/\bcolorama\b/]},
  {key:'paint', subcategoryKey:'paintStore', priority:138, reason:'brand', name:[/\bhappy homes\b/]},
  {key:'paint', subcategoryKey:'painting', priority:118, reason:'name', name:[/\bmaleri\b/,/\bmalare\b/,/\bmalerservice\b/,/\bpainting(?: service)?\b/]},
  {key:'paint', subcategoryKey:'paintStore', priority:115, reason:'name', name:[/\bfargbutik\b/,/\bfarghandel\b/,/\btapetbutik\b/]},
  {key:'paint', subcategoryKey:'floor', priority:115, reason:'name', name:[/\bgolvslip(?:ning)?\b/,/\bgolvservice\b/,/\bgolvlagg(?:ning|are)?\b/]},

  // Ground / garden services
  {key:'groundTree', subcategoryKey:'garden', priority:118, reason:'name', name:[/\btradgardsservice\b/,/\btradgardsskotsel\b/,/\blandskapsvard\b/]},
  {key:'groundTree', subcategoryKey:'tree', priority:118, reason:'name', name:[/\btradfall(?:ning)?\b/,/\barborist\b/]},
  {key:'groundTree', subcategoryKey:'ground', priority:118, reason:'name', name:[/\bmarkservice\b/,/\bmarkentreprenad\b/,/\bgrav(?:ning|service)?\b/,/\bschakt(?:ning)?\b/]},
  {key:'groundTree', subcategoryKey:'paving', priority:116, reason:'name', name:[/\bstenlagg(?:ning)?\b/]},

  // Cleaning
  {key:'clean', subcategoryKey:'pest', priority:142, reason:'brand', name:[/\banticimex\b/,/\bnomor\b/,/\brentokil\b/]},
  {key:'clean', subcategoryKey:'remediation', priority:142, reason:'brand', name:[/\bocab\b/]},
  {key:'clean', subcategoryKey:'specialist', priority:125, reason:'name', name:[/\bmattvatt\b/,/\btextiltvatt\b/]},
  {key:'clean', subcategoryKey:'cleaning', priority:120, reason:'name', name:[/\bstadtjanst(?:er)?\b/,/\bstadservice\b/,/\bstadfirma\b/,/\blokalvard\b/,/\bflyttstad(?:ning)?\b/,/\bhemstad(?:ning)?\b/,/\bkontorsstad(?:ning)?\b/,/\bcleaning(?: service)?\b/,/\bjanitorial(?: service| services)?\b/]},
  {key:'clean', subcategoryKey:'windows', priority:120, reason:'name', name:[/\bfonsterputs(?:ning)?\b/]},
  {key:'clean', subcategoryKey:'remediation', priority:120, reason:'name', name:[/\bsanering(?:sservice)?\b/,/\bfuktskada\b/,/\bvattenskada\b/]},
  {key:'clean', subcategoryKey:'pest', priority:120, reason:'name', name:[/\bskadedjur(?:sbekampning)?\b/,/\bpest control\b/]},

  // Security
  {key:'locksmith', subcategoryKey:'alarm', priority:140, reason:'brand', name:[/\bverisure\b/,/\bsector alarm\b/]},
  {key:'locksmith', subcategoryKey:'locks', priority:120, reason:'name', name:[/\blasmed\b/,/\blasmastar(?:e|en|n)?\b/,/\blas(?: och)? sakerhet\b/,/\blas service\b/,/\blocksmith\b/]},
  {key:'locksmith', subcategoryKey:'alarm', priority:118, reason:'name', name:[/\blarmteknik\b/,/\blarmservice\b/]},
  {key:'locksmith', subcategoryKey:'access', priority:118, reason:'name', name:[/\bpassagesystem\b/,/\bkamerabevakning\b/]},

  // Building service
  {key:'build', subcategoryKey:'carpentry', priority:120, reason:'name', name:[/\bsnickeri\b/,/\bsnickare\b/,/\bsnickarn\b/,/\bsnickar n\b/,/\bsnickaren\b/,/\bfinsnickeri\b/]},
  {key:'build', subcategoryKey:'roof', priority:118, reason:'name', name:[/\btaklagg(?:are|ning)?\b/,/\btakservice\b/]},
  {key:'build', subcategoryKey:'doors', priority:142, reason:'brand', name:[/\bgarageportexperten\b/,/\bmockfjards\b/,/\belitfonster\b/]},
  {key:'build', subcategoryKey:'doors', priority:118, reason:'name', name:[/\bgarageport(?:ar)?\b/,/\bportexpert\b/,/\bytterdorr(?:ar)?\b/,/\bfonsterbyte\b/,/\bglasmastare\b/]},
  {key:'build', subcategoryKey:'sunProtection', priority:118, reason:'name', name:[/\bmarkiser?\b/,/\bsolskydd\b/]},
  {key:'build', subcategoryKey:'facade', priority:118, reason:'name', name:[/\bplatslageri\b/,/\bfasadservice\b/,/\bbyggplat\b/]},
  {key:'build', subcategoryKey:'general', priority:112, reason:'name', name:[/\bbyggservice\b/,/\bbyggfirma\b/,/\bbyggmastare\b/,/\bbyggentreprenad\b/,/\brenovering(?:sservice)?\b/]},

  // Consultants
  {key:'consult', subcategoryKey:'architect', priority:115, reason:'name', name:[/\barkitekt(?:er|byra)?\b/]},
  {key:'consult', subcategoryKey:'inspection', priority:115, reason:'name', name:[/\bbesiktning(?:sman)?\b/,/\bbyggbesiktning\b/,/\bfastighetsbesiktning\b/]},
  {key:'consult', subcategoryKey:'energy', priority:115, reason:'name', name:[/\benergideklaration\b/,/\benergikonsult\b/]},
  {key:'consult', subcategoryKey:'technical', priority:108, reason:'name', name:[/\bbyggkonsult\b/,/\bprojektering\b/,/\bteknikkonsult\b/]},

  // Firewood
  {key:'firewood', subcategoryKey:'fireplace', priority:140, reason:'brand', name:[/\belda butiken\b/,/\beldabutiken\b/]},
  {key:'firewood', subcategoryKey:'chimney', priority:120, reason:'name', name:[/\bsotare\b/,/\bsotning\b/,/\bskorstensservice\b/,/\bskorstensfejare\b/]},
  {key:'firewood', subcategoryKey:'fireplace', priority:120, reason:'name', name:[/\bkamin(?:er|butik)?\b/,/\beldstad(?:er|butik)?\b/]},
  {key:'firewood', subcategoryKey:'firewood', priority:118, reason:'name', name:[/\bbrasved\b/,/\bvedhandel\b/,/\bvedleverans\b/,/\bvedforsaljning\b/,/\bfirewood\b/]},
  {key:'firewood', subcategoryKey:'pellets', priority:118, reason:'name', name:[/\bpellets(?:leverans|forsaljning)?\b/]}
];

const HARD_NEGATIVE_NAME_RULES = [
  /\bturistbyra\b/,/\bturistinformation\b/,/\btourist information\b/,/\bresebyra\b/,
  /\bforskola\b/,/\bskola\b/,/\bgymnasium\b/,/\buniversitet\b/,/\bsimhall\b/,/\bbadhus\b/,
  /\bkyrka\b/,/\bmuseum\b/,/\bbibliotek\b/,/\brestaurang\b/,/\bpizzeria\b/,/\bcafe\b/,
  /\bhotell\b/,/\bapotek\b/,/\bvardcentral\b/,/\bsjukhus\b/,
  /\bmanpower\b/,/\bexperis\b/,/\buniflex\b/,/\badecco\b/,/\brandstad\b/,
  /\brusta och matcha\b/,/\brekrytering\b/,/\bantikvariat\b/,/\bbokhandel\b/,
  /\bhela manniskan ria\b/,
  /\bbilglas\b/,/\bautoglas\b/,/\bwindshield\b/,/\bcharging station\b/,/\bladdstation\b/,
  /\bkayakomat\b/,/\bdr clauder\b/
];


// Most Places do not need a name/brand override. One cheap precheck avoids
// running the full profile rule set for every taxonomy-matched POI in dense
// city tiles.
const PROFILE_HINT_RE = /(?:cervera|hemtex|sang|madrass|kungsang|sova|ikea|jysk|mio|svenska hem|em home|lagerhaus|marbodal|kvik|vedum|hth|ballingslov|noblessa|puustelli|widedals|vackert hemma|elon|elgiganten|euronics|electrolux home|ljud|audio|vitvar|clas ohlson|jem|jula|biltema|rusta|bauhaus|hornbach|byggmax|beijer|rauta|optimera|xl bygg|woody|bolist|derome|plantagen|granngarden|blomsterlandet|cramo|ramirent|renta|lambertsson|stavdal|freetrailer|slaputhyr|slapvagnsuthyr|svea solar|sesol|1komma5|anticimex|nomor|rentokil|ocab|verisure|sector alarm|garageportexperten|mockfjards|elitfonster|happy homes|eldabutiken|husgerad|kokstillbehor|kokredskap|porslin|bosattning|mattor|hemtextil|gardin|mobel|elektr|eltjanst|elservice|elmontage|elkraft|solcell|laddbox|vvs|rormok|rorservice|rorteknik|varmepump|ventilation|flugger|nordsjo|colorama|maleri|malare|farg|tapet|golv|tradgard|arborist|markservice|markentreprenad|schakt|gravning|jarnhandel|byggmarknad|byggvaruhus|hemmafix|byggmaterial|byggvaror|bygghandel|bradgard|virke|verktyg|maskinuthyr|stadtjanst|stadservice|lokalvard|fonsterputs|sanering|skadedjur|lasmed|lasmastar|larm|passage|snicker|snickar|snickarn|taklagg|garageport|ytterdorr|byggservice|byggfirma|byggmastare|renovering|arkitekt|besiktning|energikonsult|projektering|teknikkonsult|vedhandel|vedleverans|vedforsaljning|pellets)/;
const PROFILE_DOMAIN_HINT_RE = /(?:cervera\.se|hemtex\.se|clasohlson\.com|jemfix\.se|plantagen\.|granngarden\.se|elon\.se|kungsangen\.com|sangfabriken\.se|freetrailer\.)/i;

function ruleMatches(rule, ctx) {
  const nameOrBrand = `${ctx.name} ${ctx.brand}`.trim();
  const nameMatch = (rule.name || []).some(re => re.test(nameOrBrand));
  const domainMatch = (rule.domain || []).some(re => re.test(ctx.websites));
  return nameMatch || domainMatch;
}

function strongProfileClassification(properties = {}) {
  const quickName = normalizeNameText(placeName(properties));
  const quickBrandRaw = String(properties.brand ?? properties['brand.names.primary'] ?? '').toLowerCase();
  const quickWebsiteRaw = String(properties.websites ?? '').toLowerCase();
  if (!PROFILE_HINT_RE.test(quickName) &&
      !PROFILE_HINT_RE.test(normalizeNameText(quickBrandRaw)) &&
      !PROFILE_DOMAIN_HINT_RE.test(quickWebsiteRaw)) return null;

  const ctx = profileContext(properties);
  if (!ctx.name && !ctx.brand && !ctx.websites) return null;
  const matches = PROFILE_RULES.filter(rule => ruleMatches(rule, ctx))
    .sort((a,b) => b.priority - a.priority);
  if (!matches.length) return null;
  const topPriority = matches[0].priority;
  const top = matches.filter(m => m.priority === topPriority);
  const signatures = new Set(top.map(m => `${m.key}:${m.subcategoryKey}`));
  if (signatures.size !== 1) return null;
  const match = top[0];
  const category = CATEGORIES[match.key];
  return {
    key: match.key,
    subcategoryKey: match.subcategoryKey,
    subcategoryLabel: category?.subcategories?.[match.subcategoryKey]?.label || category?.label || '',
    basis: match.reason === 'brand' ? 'profile' : 'name',
    reason: match.reason || 'name',
    score: match.priority
  };
}

export function strongNameCategory(properties = {}) {
  return strongProfileClassification(properties)?.key || null;
}

function hasHardNegativeName(properties = {}) {
  const name = normalizeNameText(placeName(properties));
  return Boolean(name && HARD_NEGATIVE_NAME_RULES.some(rule => rule.test(name)));
}

function taxonomyParts(properties = {}) {
  const taxonomy = safeJson(properties.taxonomy, {});
  const legacy = safeJson(properties.categories, {});
  return {
    basic: flattenStrings(properties.basic_category),
    primary: flattenStrings(taxonomy?.primary),
    hierarchy: flattenStrings(taxonomy?.hierarchy),
    alternates: flattenStrings(taxonomy?.alternates ?? taxonomy?.alternate),
    legacyPrimary: flattenStrings(legacy?.primary),
    legacyAlternates: flattenStrings(legacy?.alternate ?? legacy?.alternates)
  };
}

function normalizeParts(parts) {
  return Object.fromEntries(Object.entries(parts).map(([key, values]) => [
    key, values.map(normalizeToken).filter(Boolean)
  ]));
}

export function categoryTokens(properties = {}) {
  return Object.values(taxonomyParts(properties)).flat().filter(Boolean).map(normalizeToken).filter(Boolean);
}

function isLeafMatchToken(token, needle) {
  return token === needle || token.endsWith(`_${needle}`) || (!needle.endsWith('s') && token.endsWith(`_${needle}s`));
}

function tokenContainsTermToken(token, needle) {
  const value = `_${token}_`;
  if (value.includes(`_${needle}_`)) return true;
  if (!needle.endsWith('s') && value.includes(`_${needle}s_`)) return true;
  if (needle.endsWith('s') && needle.length > 4 && value.includes(`_${needle.slice(0, -1)}_`)) return true;
  return false;
}

const CATEGORY_TERM_TOKENS = Object.freeze(Object.fromEntries(
  Object.entries(CATEGORIES).map(([key, category]) => [key, [...new Set(category.terms.map(normalizeToken).filter(Boolean))]])
));

const SUBCATEGORY_TERM_TOKENS = Object.freeze(Object.fromEntries(
  Object.entries(CATEGORIES).map(([key, category]) => [key, Object.fromEntries(
    Object.entries(category.subcategories || {}).map(([subKey, sub]) => [subKey, [...new Set((sub.terms || []).map(normalizeToken).filter(Boolean))]])
  )])
));

// Inverted taxonomy index. Dense city tiles can contain thousands of Places;
// scanning every configured term for every Place is unnecessarily expensive.
// Instead, each taxonomy token is decomposed once and looked up in this index.
const TAXONOMY_TERM_INDEX = new Map();
function addTaxonomyIndexTerm(alias, categoryKey, subcategoryKey) {
  if (!alias) return;
  let entries = TAXONOMY_TERM_INDEX.get(alias);
  if (!entries) { entries = []; TAXONOMY_TERM_INDEX.set(alias, entries); }
  if (!entries.some(item => item.categoryKey === categoryKey && item.subcategoryKey === subcategoryKey)) {
    entries.push({categoryKey, subcategoryKey});
  }
}
for (const [categoryKey, subMap] of Object.entries(SUBCATEGORY_TERM_TOKENS)) {
  for (const [subcategoryKey, terms] of Object.entries(subMap)) {
    for (const term of terms) {
      addTaxonomyIndexTerm(term, categoryKey, subcategoryKey);
      // Preserve the tolerant singular/plural behavior of the older matcher.
      if (term.endsWith('s') && term.length > 4) addTaxonomyIndexTerm(term.slice(0, -1), categoryKey, subcategoryKey);
      else addTaxonomyIndexTerm(`${term}s`, categoryKey, subcategoryKey);
    }
  }
}

const TAXONOMY_SOURCE_WEIGHTS = Object.freeze({
  primary: [50, 44],
  basic: [38, 34],
  hierarchy: [27, 23],
  alternates: [20, 17],
  legacyPrimary: [12, 10],
  legacyAlternates: [8, 8]
});

function scoreTaxonomyIndexed(parts) {
  const categoryScores = Object.create(null);
  const subcategoryScores = Object.create(null);
  const alternateExact = new Set();

  const apply = (alias, sourceKey, isLeaf) => {
    const entries = TAXONOMY_TERM_INDEX.get(alias);
    if (!entries) return;
    const weights = TAXONOMY_SOURCE_WEIGHTS[sourceKey] || [0, 0];
    const score = isLeaf ? weights[0] : weights[1];
    if (!score) return;
    for (const {categoryKey, subcategoryKey} of entries) {
      categoryScores[categoryKey] = Math.max(categoryScores[categoryKey] || 0, score);
      const key = `${categoryKey}:${subcategoryKey}`;
      subcategoryScores[key] = Math.max(subcategoryScores[key] || 0, score);
      if (sourceKey === 'alternates' && isLeaf) alternateExact.add(categoryKey);
    }
  };

  for (const [sourceKey, values] of Object.entries(parts)) {
    if (!(sourceKey in TAXONOMY_SOURCE_WEIGHTS)) continue;
    for (const rawToken of values || []) {
      const token = normalizeToken(rawToken);
      if (!token) continue;
      const words = token.split('_').filter(Boolean);
      const seen = new Set();

      // Whole token and every suffix correspond to the previous leaf/suffix
      // semantics (e.g. services_home_services_plumber -> plumber).
      for (let start = 0; start < words.length; start++) {
        const alias = words.slice(start).join('_');
        if (seen.has(`L:${alias}`)) continue;
        seen.add(`L:${alias}`);
        apply(alias, sourceKey, true);
      }

      // Interior n-grams cover tolerant containment without iterating hundreds
      // of configured terms. Taxonomy labels are short, so this remains tiny.
      for (let start = 0; start < words.length; start++) {
        for (let end = start + 1; end <= words.length; end++) {
          if (end === words.length) continue; // suffix already handled as leaf
          const alias = words.slice(start, end).join('_');
          if (seen.has(`C:${alias}`)) continue;
          seen.add(`C:${alias}`);
          apply(alias, sourceKey, false);
        }
      }
    }
  }
  return {categoryScores, subcategoryScores, alternateExact};
}

function scoreTerms(terms, parts) {
  let score = 0;
  for (const term of terms || []) {
    if (parts.primary.some(v => isLeafMatchToken(v, term))) score = Math.max(score, 50);
    else if (parts.primary.some(v => tokenContainsTermToken(v, term))) score = Math.max(score, 44);
    if (parts.basic.some(v => isLeafMatchToken(v, term))) score = Math.max(score, 38);
    else if (parts.basic.some(v => tokenContainsTermToken(v, term))) score = Math.max(score, 34);
    if (parts.hierarchy.some(v => isLeafMatchToken(v, term))) score = Math.max(score, 27);
    else if (parts.hierarchy.some(v => tokenContainsTermToken(v, term))) score = Math.max(score, 23);
    if (parts.alternates.some(v => isLeafMatchToken(v, term))) score = Math.max(score, 20);
    else if (parts.alternates.some(v => tokenContainsTermToken(v, term))) score = Math.max(score, 17);
    if (parts.legacyPrimary.some(v => isLeafMatchToken(v, term))) score = Math.max(score, 12);
    else if (parts.legacyPrimary.some(v => tokenContainsTermToken(v, term))) score = Math.max(score, 10);
    if (parts.legacyAlternates.some(v => isLeafMatchToken(v, term))) score = Math.max(score, 8);
  }
  return score;
}

function hasExactMatch(terms, values) {
  return (terms || []).some(term => (values || []).some(value => isLeafMatchToken(value, term)));
}

function exactAlternateCategoryMatch(categoryKey, parts, indexedScores = null) {
  const scored = indexedScores || scoreTaxonomyIndexed(parts);
  return scored.alternateExact.has(categoryKey);
}

function rankedTaxonomyCategories(parts, indexedScores = null) {
  const scored = indexedScores || scoreTaxonomyIndexed(parts);
  return Object.keys(CATEGORIES)
    .map(key => ({key, score: scored.categoryScores[key] || 0}))
    .sort((a,b) => b.score - a.score || a.key.localeCompare(b.key));
}

function categoryConfidence(score, basis = 'taxonomy', profilePriority = 0) {
  if (basis === 'profile') return 'high';
  if (basis === 'name') return profilePriority >= 115 ? 'high' : 'medium';
  if (score >= 44) return 'high';
  if (score >= 34) return 'medium';
  return 'low';
}

function taxonomyCategoryMatch(categoryKey, score, parts, basis = 'taxonomy', indexedScores = null) {
  const category = CATEGORIES[categoryKey];
  const sub = classifySubcategory(categoryKey, parts, indexedScores);
  return {
    key: categoryKey,
    label: category?.label || categoryKey,
    subcategoryKey: sub.key,
    subcategoryLabel: sub.label || category?.label || '',
    score,
    basis,
    confidence: categoryConfidence(score, basis)
  };
}

function entityTypeForCategory(categoryKey, subcategoryKey = '') {
  if (categoryKey === 'consult') return 'consultant';
  if (['supplies','home','appliances'].includes(categoryKey)) return 'retail';
  if (categoryKey === 'tools') {
    if (subcategoryKey === 'rental' || subcategoryKey === 'transportRental') return 'rental';
    if (subcategoryKey === 'service') return 'service';
    return 'retail';
  }
  if (categoryKey === 'paint') return subcategoryKey === 'paintStore' ? 'retail' : 'service';
  if (categoryKey === 'firewood') return subcategoryKey === 'chimney' ? 'service' : 'retail';
  return 'service';
}

function secondaryTaxonomyMatches(parts, primaryKey, ranked = null, indexedScores = null, primarySubcategoryKey = '') {
  const scored = indexedScores || scoreTaxonomyIndexed(parts);
  const ordered = ranked || rankedTaxonomyCategories(parts, scored);
  const primaryType = entityTypeForCategory(primaryKey, primarySubcategoryKey);
  const primaryScore = ordered.find(item => item.key === primaryKey)?.score || 0;
  const out = [];
  for (const item of ordered) {
    if (item.key === primaryKey || item.score <= 0) continue;
    const match = taxonomyCategoryMatch(item.key, item.score, parts, 'taxonomy', scored);
    const secondaryType = entityTypeForCategory(match.key, match.subcategoryKey);
    const sameOperationalType = primaryType === secondaryType;

    // Secondary categories are deliberately conservative. Cross-type noise
    // (for example an electrician also becoming "byggvaror") is hidden. A
    // taxonomy alternate is only retained for genuine service/service overlap
    // when the primary branch itself has strong Overture evidence.
    const strongIndependent = sameOperationalType && item.score >= 44;
    const explicitServiceAlternate = primaryType === 'service' && secondaryType === 'service' &&
      primaryScore >= 44 && item.score >= 20 && exactAlternateCategoryMatch(item.key, parts, scored);
    if (!strongIndependent && !explicitServiceAlternate) continue;

    out.push(match);
    if (out.length >= 1) break;
  }
  return out;
}

function enrichClassification(primary, secondary = []) {
  const category = CATEGORIES[primary.key];
  const first = {
    key: primary.key,
    label: category?.label || primary.key,
    subcategoryKey: primary.subcategoryKey || category?.defaultSubcategory?.[0] || '',
    subcategoryLabel: primary.subcategoryLabel || category?.label || '',
    score: Number(primary.score) || 0,
    basis: primary.basis || 'taxonomy',
    confidence: primary.categoryConfidence || categoryConfidence(Number(primary.score) || 0, primary.basis || 'taxonomy', Number(primary.score) || 0)
  };
  const unique = [first];
  for (const item of secondary) {
    if (!item?.key || unique.some(existing => existing.key === item.key)) continue;
    unique.push(item);
  }
  return {
    ...primary,
    categoryConfidence: first.confidence,
    entityType: entityTypeForCategory(first.key, first.subcategoryKey),
    categoryMatches: unique,
    categoryKeys: unique.map(item => item.key),
    secondaryCategories: unique.slice(1)
  };
}

function classifySubcategory(categoryKey, parts, indexedScores = null) {
  const category = CATEGORIES[categoryKey];
  if (!category) return {key:null, label:''};
  const scored = indexedScores || scoreTaxonomyIndexed(parts);
  const ranked = Object.keys(SUBCATEGORY_TERM_TOKENS[categoryKey] || {})
    .map(key => ({key, score: scored.subcategoryScores[`${categoryKey}:${key}`] || 0}))
    .sort((a,b) => b.score - a.score || a.key.localeCompare(b.key));
  const best = ranked[0];
  if (best?.score > 0) {
    return {key: best.key, label: category.subcategories[best.key]?.label || '', score: best.score};
  }
  const [key, label] = category.defaultSubcategory || [null, ''];
  return {key, label, score:0};
}

const NEGATIVE_CATEGORY_TERMS = [
  'restaurant','cafe','bar','pub','hotel','hostel','school','preschool','kindergarten','college','university',
  'church','place_of_worship','dentist','doctor','hospital','clinic','pharmacy','supermarket','grocery','clothing',
  'beauty_salon','hair_salon','car_dealer','gas_station','bank','insurance','real_estate_agent','swimming_pool',
  'sports_centre','sports_center','stadium','gym','library','museum','cinema','tourist_information','travel_agency',
  'employment_agency','staffing_agency','recruitment_agency','recruiter','temp_agency','temporary_employment_agency'
].map(normalizeToken);

const AUTOMOTIVE_TERMS = [
  'auto_glass','automotive_glass','car_glass','windshield_repair','windshield_service','auto_repair','car_repair',
  'auto_parts_store','tire_shop','car_wash','vehicle_repair','automotive_service'
].map(normalizeToken);

const PUBLIC_CHARGING_TERMS = [
  'charging_station','electric_vehicle_charging_station','ev_charging_station','vehicle_charging_station'
].map(normalizeToken);

const LEISURE_RENTAL_TERMS = [
  'kayak_rental','canoe_rental','paddleboard_rental','sup_rental','boat_rental','water_sports_equipment_rental',
  'bicycle_rental','bike_rental','ski_rental','sports_equipment_rental','outdoor_recreation_rental'
].map(normalizeToken);

const PET_RETAIL_TERMS = [
  'pet_store','pet_supply_store','pet_food_store','animal_feed_store','animal_food_store','dog_food_store','cat_food_store',
  'veterinary_supply_store','pet_services'
].map(normalizeToken);

const IT_ONLY_TERMS = [
  'computer_store','computer_repair','computer_repair_service','computer_consultant','it_consultant','it_service',
  'information_technology_service','software_company','web_design','computer_support_service'
].map(normalizeToken);

const HOME_NETWORK_TERMS = [
  'network_installer','network_cabling_service','data_cabling','structured_cabling','fiber_optic_installer',
  'home_automation_service','smart_home_service','security_system_installer'
].map(normalizeToken);

const INDUSTRIAL_TERMS = [
  'factory','manufacturer','manufacturing','industrial_manufacturer','industrial_equipment','industrial_equipment_supplier',
  'machine_shop','industrial_supplier','industrial_wholesaler','industrial_engineering','industrial_consultant'
].map(normalizeToken);

const HOME_RELEVANCE_TERMS = [
  'home_service','residential','retail','store','shop','home_improvement','building_material','hardware','paint_store',
  'appliance_store','door','window','roof','plumbing','electrician','landscaping','cleaning','security','architect',
  'building_inspector','property_inspector','furniture_store','mattress_store','garden_center','tool_store'
].map(normalizeToken);

function anyTokenMatch(tokens, terms) {
  return terms.some(term => tokens.some(token => tokenContainsTermToken(token, term)));
}

function hasNegativeCategorySignal(parts) {
  return anyTokenMatch([...parts.basic, ...parts.primary], NEGATIVE_CATEGORY_TERMS);
}

function shouldRejectNonHomeBusiness(parts) {
  const high = [...parts.basic, ...parts.primary];
  const all = Object.values(parts).flat();
  if (anyTokenMatch(high, AUTOMOTIVE_TERMS)) return true;
  if (anyTokenMatch(high, PUBLIC_CHARGING_TERMS)) return true;
  if (anyTokenMatch(high, LEISURE_RENTAL_TERMS)) return true;
  if (anyTokenMatch(high, PET_RETAIL_TERMS)) return true;
  if (anyTokenMatch(high, IT_ONLY_TERMS) && !anyTokenMatch(all, HOME_NETWORK_TERMS)) return true;
  const industrial = anyTokenMatch(high, INDUSTRIAL_TERMS);
  const homeRelevant = anyTokenMatch(all, HOME_RELEVANCE_TERMS);
  return industrial && !homeRelevant;
}

function rawTaxonomyText(properties = {}) {
  let raw = '';
  for (const value of [properties.basic_category, properties.taxonomy, properties.categories]) {
    if (value == null || value === '') continue;
    if (typeof value === 'string') raw += ` ${value}`;
    else { try { raw += ` ${JSON.stringify(value)}`; } catch {} }
  }
  return raw;
}

function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
const CATEGORY_PREFILTER_TERMS = [...new Set(Object.values(CATEGORIES).flatMap(c => c.terms.flatMap(term => {
  const value = String(term).toLowerCase();
  if (!value) return [];
  const variants = [value];
  if (value.endsWith('s') && value.length > 4) variants.push(value.slice(0,-1)); else variants.push(`${value}s`);
  return variants;
})))].sort((a,b) => b.length - a.length);
const CATEGORY_PREFILTER_RE = new RegExp(`(?:^|[^a-z0-9])(?:${CATEGORY_PREFILTER_TERMS.map(term => term.split('_').map(escapeRegex).join('[^a-z0-9]+')).join('|')})(?:$|[^a-z0-9])`, 'i');

export function mightMatchCategory(properties = {}) {
  if (hasHardNegativeName(properties)) return false;
  if (strongProfileClassification(properties)) return true;
  const raw = rawTaxonomyText(properties);
  return Boolean(raw && CATEGORY_PREFILTER_RE.test(raw));
}

export function classifyPlaceDetailed(properties = {}) {
  if (hasHardNegativeName(properties)) return null;

  const profile = strongProfileClassification(properties);
  const rawParts = taxonomyParts(properties);
  const hasAnyTaxonomy = Object.values(rawParts).flat().filter(Boolean).length > 0;
  const parts = hasAnyTaxonomy ? normalizeParts(rawParts) : null;
  const indexedScores = parts ? scoreTaxonomyIndexed(parts) : null;

  // Explicit, unambiguous business profiles (brand/domain or descriptive trade
  // names) are allowed to correct noisy provider taxonomy. Still retain strong
  // Overture alternates as secondary categories for multi-service companies.
  if (profile) {
    const secondary = parts && !shouldRejectNonHomeBusiness(parts)
      ? secondaryTaxonomyMatches(parts, profile.key, null, indexedScores, profile.subcategoryKey)
      : [];
    return enrichClassification(profile, secondary);
  }

  if (!hasAnyTaxonomy) return null;
  if (shouldRejectNonHomeBusiness(parts)) return null;

  const ranked = rankedTaxonomyCategories(parts, indexedScores);
  const best = ranked[0];
  const second = ranked[1];
  const hasModernTaxonomy = [...parts.basic, ...parts.primary, ...parts.hierarchy, ...parts.alternates].length > 0;
  const minimumScore = hasModernTaxonomy ? 20 : 11;
  if (!best || best.score < minimumScore) return null;

  // A score below hierarchy strength is only accepted when Overture explicitly
  // supplied that branch as an alternate. This removes weak substring matches.
  if (hasModernTaxonomy && best.score < 27 && !exactAlternateCategoryMatch(best.key, parts, indexedScores)) return null;

  // Be conservative when modern taxonomy points nearly equally to unrelated
  // branches. A missing result is preferable to a confidently wrong category.
  if (second && best.score < 34 && second.score >= best.score - 2) return null;
  if (hasNegativeCategorySignal(parts) && best.score < 34) return null;

  const sub = classifySubcategory(best.key, parts, indexedScores);
  const primary = {
    key:best.key,
    subcategoryKey:sub.key,
    subcategoryLabel:sub.label,
    basis:'taxonomy',
    reason:'overture_taxonomy',
    score:best.score,
    subcategoryScore:sub.score,
    categoryConfidence: categoryConfidence(best.score, 'taxonomy')
  };
  return enrichClassification(primary, secondaryTaxonomyMatches(parts, best.key, ranked, indexedScores, sub.key));
}

export function classifyPlace(properties = {}) { return classifyPlaceDetailed(properties)?.key || null; }

export function isUsablePlace(properties = {}, minimumConfidence = 0.55) {
  const status = String(properties.operating_status || '').toLowerCase();
  if (status === 'permanently_closed') return false;
  const confidence = Number(properties.confidence);
  if (Number.isFinite(confidence) && confidence < minimumConfidence) return false;
  return true;
}

export function normalizeUrl(value) {
  if (!value) return '';
  let candidate = String(value).trim();
  if (!/^https?:\/\//i.test(candidate)) candidate = `https://${candidate}`;
  try { const url = new URL(candidate); return ['http:','https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
}

export function firstWebsite(properties = {}) {
  for (const value of websiteValues(properties)) {
    const url = normalizeUrl(value);
    if (url) return url;
  }
  return '';
}

export function bestAddress(properties = {}) {
  const addresses = safeJson(properties.addresses, []);
  const list = Array.isArray(addresses) ? addresses : [];
  if (!list.length) return '';
  const a = list.find(x => String(x?.country || '').toUpperCase() === 'SE') || list[0] || {};
  if (a.freeform) return String(a.freeform);
  return [a.address_line1,a.locality,a.postcode,a.region].filter(Boolean).join(', ');
}

export function sourceDatasets(properties = {}) {
  const sources = safeJson(properties.sources, []);
  const list = Array.isArray(sources) ? sources : [];
  return [...new Set(list.map(x => x?.dataset).filter(Boolean).map(String))];
}

export function statusLabel(properties = {}) {
  const status = String(properties.operating_status || '').toLowerCase();
  if (status === 'open') return 'Registrerad som verksam';
  if (status === 'temporarily_closed') return 'Registrerad som tillfälligt stängd';
  if (status === 'permanently_closed') return 'Registrerad som permanent stängd';
  return 'Verksamhetsstatus saknas';
}
