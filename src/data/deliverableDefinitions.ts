import { DeliverableDefinition, DeliverableType } from '@/types/deliverableDefinitions';

export const deliverableDefinitions: Record<DeliverableType, DeliverableDefinition> = {
  persona_express_b2c: {
    whatIsIt: "Un profil détaillé de votre client idéal B2C qui transforme des données démographiques en une personne réelle avec des besoins, des frustrations et des comportements d'achat spécifiques. Ce document va au-delà des simples statistiques pour comprendre en profondeur qui est votre client, comment il pense et pourquoi il achèterait votre produit ou service.",
    whyCrucial: [
      "Réduit les coûts d'acquisition client de 30 à 50% en ciblant précisément vos efforts marketing sur les bons profils",
      "Améliore le product-market fit en construisant exactement ce dont votre client a besoin, évitant ainsi des mois de développement inutile",
      "Facilite toutes vos décisions stratégiques : pricing, canaux de distribution, messaging, partenariats",
      "Permet d'aligner toute votre équipe autour d'une vision commune du client cible"
    ],
    whenToUse: "À utiliser avant tout développement produit et campagne marketing, lorsque vous avez des hypothèses sur votre marché mais pas encore de validation terrain. Idéalement après avoir mené 5 à 10 interviews qualitatives avec des clients potentiels.",
    whatGoodContains: [
      "Démographie précise et contextualisée (âge, localisation, CSP, revenus, situation familiale)",
      "Psychographie profonde révélant les valeurs, aspirations, peurs et motivations d'achat",
      "Comportements d'achat documentés : où achète-t-il, quand, comment se décide-t-il, quel budget alloue-t-il",
      "Points de douleur spécifiques avec leur intensité émotionnelle et leur impact quotidien",
      "Citations verbatim issues d'interviews clients réels pour ancrer le persona dans la réalité",
      "Un prénom, une photo et une histoire personnelle pour humaniser et faciliter l'empathie"
    ],
    commonPitfalls: [
      {
        mistake: "Cibler \"tout le monde\" par peur de manquer des opportunités",
        solution: "Soyez radical dans votre ciblage : mieux vaut 1000 clients parfaitement alignés que 100 000 indifférents. Vous pourrez élargir plus tard."
      },
      {
        mistake: "Créer un persona basé uniquement sur vos suppositions et désirs",
        solution: "Validez systématiquement avec 5 à 10 interviews qualitatives réelles. La réalité du terrain doit primer sur vos intuitions."
      },
      {
        mistake: "Créer trop de personas dès le départ et perdre le focus",
        solution: "Commencez par UN seul persona primaire, affinez-le jusqu'à la maîtrise, puis seulement après élargissez à d'autres segments."
      }
    ]
  },

  persona_express_b2b: {
    whatIsIt: "Un profil approfondi du décideur professionnel dans votre cible B2B, incluant son contexte organisationnel, ses responsabilités, son processus de décision et les enjeux business qu'il doit résoudre. Ce livrable vous permet de comprendre non seulement la personne, mais aussi l'écosystème décisionnel dans lequel elle évolue.",
    whyCrucial: [
      "Raccourcit drastiquement les cycles de vente en adressant directement les bonnes problématiques métier",
      "Améliore votre taux de closing en anticipant les objections et en préparant les arguments décisifs",
      "Optimise votre stratégie de contenus et de lead nurturing en parlant le langage de votre cible",
      "Identifie les bons points d'entrée et influenceurs dans le processus d'achat B2B souvent complexe"
    ],
    whenToUse: "Avant de lancer votre prospection commerciale, de créer vos contenus marketing B2B ou de définir votre stratégie d'Account-Based Marketing. Particulièrement crucial lorsque vous ciblez des entreprises de taille moyenne à grande où les processus décisionnels sont multi-acteurs.",
    whatGoodContains: [
      "Identité professionnelle complète : poste, ancienneté, responsabilités clés, département",
      "Contexte organisationnel : taille d'entreprise, secteur, structure hiérarchique, budget disponible",
      "Enjeux business prioritaires et KPIs sur lesquels il est évalué",
      "Processus de décision détaillé : qui influence, qui valide, quels critères, quel timing",
      "Sources d'information privilégiées : quels médias lit-il, quels événements fréquente-t-il",
      "Objections courantes et leurs déclencheurs, avec les réponses qui fonctionnent"
    ],
    commonPitfalls: [
      {
        mistake: "Confondre l'utilisateur final avec le décideur économique",
        solution: "Cartographiez tous les acteurs du processus d'achat : utilisateur, prescripteur, décideur budgétaire, validateur technique. Créez un persona pour chaque rôle critique."
      },
      {
        mistake: "Sous-estimer la longueur et la complexité du cycle de vente B2B",
        solution: "Documentez précisément chaque étape du parcours d'achat, les délais typiques et les points de friction. Adaptez votre tunnel de conversion en conséquence."
      },
      {
        mistake: "Proposer des bénéfices produit sans lien avec les KPIs du décideur",
        solution: "Traduisez systématiquement vos features en impacts business mesurables : gain de temps, réduction de coûts, augmentation de revenus, atténuation de risques."
      }
    ]
  },

  persona_express_organismes: {
    whatIsIt: "Un profil institutionnel détaillé de votre client organisme public ou parapublic, incluant sa mission, ses contraintes budgétaires et réglementaires, son processus décisionnel spécifique et les valeurs qui guident ses choix. Ce livrable est adapté aux particularités du secteur public.",
    whyCrucial: [
      "Adapte votre approche commerciale aux spécificités du secteur public (appels d'offres, conformité, cycles budgétaires)",
      "Anticipe les contraintes réglementaires et budgétaires qui conditionnent toute décision",
      "Identifie les valeurs d'intérêt général et d'impact social qui priment sur la rentabilité pure",
      "Prépare vos réponses aux exigences de transparence et d'accountability propres au secteur public"
    ],
    whenToUse: "Lorsque vous ciblez des collectivités territoriales, administrations, établissements publics, associations subventionnées ou tout organisme à mission d'intérêt général. Indispensable avant de répondre à un appel d'offres public.",
    whatGoodContains: [
      "Identité institutionnelle : type d'organisme, mission statutaire, territoire ou population desservie",
      "Contexte organisationnel et contraintes : budget annuel, source de financement, tutelle administrative",
      "Enjeux prioritaires alignés avec l'intérêt général : accessibilité, égalité, impact social, durabilité",
      "Processus décisionnel institutionnel : conseil d'administration, commissions, calendrier budgétaire",
      "Critères de choix spécifiques : conformité réglementaire, rapport qualité-prix, références publiques",
      "Valeurs et attentes éthiques : transparence, égalité de traitement, continuité de service"
    ],
    commonPitfalls: [
      {
        mistake: "Appliquer une logique commerciale B2B classique au secteur public",
        solution: "Adaptez votre discours : mettez en avant l'impact social, la conformité et l'optimisation des deniers publics plutôt que le ROI financier pur."
      },
      {
        mistake: "Ignorer les cycles budgétaires annuels rigides du secteur public",
        solution: "Synchronisez votre prospection avec le calendrier budgétaire (souvent vote en fin d'année N-1). Anticipez les délais de paiement plus longs."
      },
      {
        mistake: "Ne pas préparer de références dans le secteur public",
        solution: "Constituez un portefeuille de références publiques. Les organismes publics sont rassurés par des cas d'usage similaires dans leur secteur."
      }
    ]
  },

  pitch: {
    whatIsIt: "Une présentation concise et percutante de votre projet d'entreprise, déclinée en trois formats (30 secondes, court, complet) pour s'adapter à différents contextes. Chaque format est conçu pour capter l'attention, susciter l'intérêt et donner envie d'en savoir plus, avec un appel à l'action clair.",
    whyCrucial: [
      "Donne une première impression professionnelle et mémorable qui peut faire la différence face à des investisseurs ou partenaires",
      "Structure votre discours pour éviter de perdre votre interlocuteur dans les détails techniques",
      "S'adapte à tous les contextes : networking informel, rendez-vous commercial, pitch de levée de fonds",
      "Force la clarification de votre proposition de valeur en vous obligeant à aller à l'essentiel"
    ],
    whenToUse: "Dès que vous commencez à parler de votre projet à l'extérieur : événements de networking, rendez-vous investisseurs, rencontres clients, candidatures à des programmes d'accompagnement. À préparer avant toute sollicitation externe.",
    whatGoodContains: [
      "Une accroche percutante qui capte immédiatement l'attention (problème ou statistique marquante)",
      "Le problème client clairement identifié avec son impact émotionnel ou économique",
      "Votre solution unique et différenciante, expliquée simplement sans jargon technique",
      "La preuve de traction ou de validation marché (clients existants, chiffres, partenariats)",
      "Un appel à l'action précis adapté à votre objectif (meeting, investissement, partenariat)",
      "Un storytelling fluide qui raconte une histoire plutôt qu'une liste de features"
    ],
    commonPitfalls: [
      {
        mistake: "Commencer par expliquer comment fonctionne votre produit au lieu du problème que vous résolvez",
        solution: "Inversez la logique : problème vécu → impact émotionnel/économique → votre solution → preuve que ça marche. Le 'comment' technique vient après."
      },
      {
        mistake: "Utiliser du jargon technique ou des acronymes que seuls les experts comprennent",
        solution: "Testez votre pitch auprès de personnes hors de votre domaine. Si votre grand-mère ne comprend pas, simplifiez encore."
      },
      {
        mistake: "Réciter un texte appris par cœur qui sonne artificiel",
        solution: "Maîtrisez la structure et les points clés, mais adaptez le vocabulaire et les exemples à votre interlocuteur. Restez naturel et conversationnel."
      }
    ]
  },

  concurrence: {
    whatIsIt: "Une analyse structurée de votre écosystème concurrentiel identifiant vos concurrents directs, indirects et solutions de substitution, avec leurs forces, faiblesses et positionnement. Ce livrable vous permet de comprendre le paysage compétitif dans lequel vous évoluez et d'identifier votre avantage distinctif.",
    whyCrucial: [
      "Évite de lancer un produit 'me-too' sans différenciation réelle, cause majeure d'échec entrepreneurial",
      "Identifie les espaces de marché non exploités ou mal servis par la concurrence existante",
      "Prépare vos arguments face aux objections 'pourquoi vous et pas le concurrent X ?'",
      "Anticipe les menaces concurrentielles et vous permet d'adapter votre stratégie en conséquence"
    ],
    whenToUse: "Après avoir défini votre proposition de valeur mais avant de finaliser votre positionnement marché. Indispensable avant tout lancement produit, levée de fonds ou pivot stratégique majeur.",
    whatGoodContains: [
      "Une cartographie complète : concurrents directs (même solution), indirects (autre approche, même besoin) et substituts (alternatives utilisées actuellement)",
      "Une analyse SWOT de chaque concurrent majeur avec preuves factuelles (prix, fonctionnalités, avis clients)",
      "L'identification de votre avantage concurrentiel défendable dans le temps",
      "Les barrières à l'entrée de votre marché et comment vous les franchissez",
      "Les tendances concurrentielles : qui monte, qui stagne, qui disparaît et pourquoi",
      "Une matrice de positionnement visuelle sur 2 axes différenciants pertinents"
    ],
    commonPitfalls: [
      {
        mistake: "Affirmer 'nous n'avons pas de concurrent' par méconnaissance du marché",
        solution: "Élargissez votre vision : si les clients n'achètent pas votre solution aujourd'hui, que font-ils ? C'est votre concurrence indirecte ou de substitution."
      },
      {
        mistake: "Se comparer uniquement sur les fonctionnalités produit en ignorant l'expérience client globale",
        solution: "Analysez l'ensemble du parcours client : facilité d'achat, onboarding, support, communauté, pricing. L'avantage peut être ailleurs que dans le produit."
      },
      {
        mistake: "Dénigrer la concurrence de manière non professionnelle",
        solution: "Restez factuels et respectueux. Montrez que vous comprenez leurs forces, puis expliquez pourquoi votre approche est différente et mieux adaptée à votre cible."
      }
    ]
  },

  marche: {
    whatIsIt: "Une étude approfondie de votre marché cible incluant sa taille, sa dynamique de croissance, les tendances structurantes, les acteurs clés et les opportunités exploitables. Ce livrable quantifie le potentiel commercial de votre projet et valide qu'il existe un marché suffisamment large et accessible.",
    whyCrucial: [
      "Valide qu'il existe un marché suffisant pour justifier votre investissement temps et argent",
      "Identifie les segments de marché les plus attractifs et accessibles pour prioriser vos efforts",
      "Renforce la crédibilité de votre projet auprès des investisseurs en démontrant une connaissance marché solide",
      "Détecte les tendances porteuses ou les menaces réglementaires qui impacteront votre business"
    ],
    whenToUse: "En phase d'étude de faisabilité, avant de s'engager sérieusement sur un projet. Absolument indispensable avant toute levée de fonds significative ou lancement de produit coûteux. À actualiser régulièrement (annuellement minimum).",
    whatGoodContains: [
      "Une estimation de la taille de marché TAM (Total Addressable Market), SAM (Serviceable Available Market) et SOM (Serviceable Obtainable Market) avec méthodologie",
      "Les taux de croissance historiques et projetés du marché avec sources fiables",
      "La segmentation du marché en sous-ensembles homogènes avec leur attractivité respective",
      "Les tendances macro qui dynamisent ou freinent le marché : réglementaires, technologiques, sociétales",
      "Les barrières à l'entrée et facteurs clés de succès sur ce marché",
      "Une analyse de la chaîne de valeur : qui capture quelle part de la valeur créée"
    ],
    commonPitfalls: [
      {
        mistake: "Confondre TAM (marché théorique total) avec votre marché accessible réellement",
        solution: "Affinez progressivement : TAM → SAM (votre segment géographique/cible) → SOM (ce que vous pouvez réalistement capturer dans 3-5 ans). Soyez honnêtes."
      },
      {
        mistake: "S'appuyer sur des études de marché payantes hors de prix ou des chiffres invérifiables",
        solution: "Combinez sources gratuites (INSEE, études sectorielles publiques, rapports annuels), interviews terrain et extrapolations prudentes. La cohérence prime sur la précision."
      },
      {
        mistake: "Analyser un marché trop large qui ne correspond pas à votre réalité opérationnelle",
        solution: "Concentrez-vous sur le marché que vous pouvez servir dans les 2-3 prochaines années avec vos ressources. Un petit marché maîtrisé vaut mieux qu'un grand marché inaccessible."
      }
    ]
  },

  proposition_valeur: {
    whatIsIt: "L'énoncé clair et différenciant de la valeur unique que vous apportez à votre client cible, expliquant pourquoi il devrait vous choisir plutôt qu'une alternative. C'est la promesse centrale qui guidera toute votre communication marketing et commerciale.",
    whyCrucial: [
      "Clarifie votre positionnement et évite de ressembler à tous vos concurrents",
      "Guide toutes vos décisions produit : quelles fonctionnalités développer en priorité",
      "Facilite la création de vos contenus marketing en donnant un fil rouge cohérent",
      "Améliore drastiquement vos taux de conversion en parlant directement aux motivations profondes de votre cible"
    ],
    whenToUse: "Après avoir défini votre persona et analysé votre marché, mais avant de créer vos supports marketing ou de développer votre produit final. À affiner en continu sur la base des retours clients.",
    whatGoodContains: [
      "Un énoncé concis de votre promesse différenciante en une phrase mémorable",
      "Les bénéfices clients concrets et mesurables (gain de temps, économie, réduction de risque)",
      "La preuve de votre capacité à délivrer cette valeur (technologie, expertise, partenariats)",
      "Votre différenciation claire face aux alternatives existantes",
      "Un Value Proposition Canvas complet alignant votre offre avec les jobs, pains et gains du client",
      "Des exemples concrets ou cas d'usage qui illustrent la valeur créée"
    ],
    commonPitfalls: [
      {
        mistake: "Lister des caractéristiques produit au lieu de bénéfices clients tangibles",
        solution: "Pour chaque feature, posez-vous 'Et alors, qu'est-ce que ça change concrètement pour le client ?' Descendez jusqu'au bénéfice émotionnel ou économique final."
      },
      {
        mistake: "Utiliser un vocabulaire marketing générique sans aspérités ('solution innovante', 'leader du marché')",
        solution: "Soyez spécifiques et factuels : '3x plus rapide', 'économisez 2h par jour', 'zéro configuration technique'. Le concret bat le superlatif."
      },
      {
        mistake: "Créer une proposition de valeur qui plaît à tout le monde donc à personne",
        solution: "Acceptez de déplaire à certains segments pour parler fortement à votre cœur de cible. Une proposition polarisante est souvent plus efficace qu'une proposition consensuelle."
      }
    ]
  },

  business_model: {
    whatIsIt: "La description structurée de comment votre entreprise crée, délivre et capture de la valeur, incluant vos sources de revenus, votre structure de coûts, vos ressources clés et vos partenaires stratégiques. Généralement formalisé via le Business Model Canvas.",
    whyCrucial: [
      "Transforme une idée en un modèle économique viable et scalable",
      "Identifie les hypothèses critiques à valider avant d'investir massivement",
      "Facilite la communication de votre modèle économique aux investisseurs et partenaires",
      "Permet d'explorer différentes options de monétisation et de choisir la plus pertinente"
    ],
    whenToUse: "En phase de conception du projet, après avoir validé l'adéquation problème-solution mais avant de construire votre business plan détaillé. À revisiter régulièrement, surtout lors de pivots stratégiques.",
    whatGoodContains: [
      "Vos segments de clientèle priorisés et leurs caractéristiques distinctes",
      "Votre proposition de valeur spécifique à chaque segment",
      "Vos canaux de distribution et de communication pour atteindre les clients",
      "Le type de relation client que vous établissez (self-service, premium, communauté)",
      "Vos flux de revenus détaillés avec modèle de pricing (abonnement, freemium, commission)",
      "Vos ressources clés (humaines, technologiques, financières) et activités clés",
      "Vos partenaires stratégiques critiques et votre structure de coûts"
    ],
    commonPitfalls: [
      {
        mistake: "Copier le business model d'un concurrent sans l'adapter à vos spécificités",
        solution: "Inspirez-vous des modèles qui fonctionnent mais innovez sur au moins une dimension (pricing, canal, relation client) pour créer votre avantage."
      },
      {
        mistake: "Sous-estimer vos coûts réels et surestimer votre capacité à monétiser rapidement",
        solution: "Appliquez un coefficient de prudence : coûts x1.5, délais de monétisation x2. Identifiez votre seuil de rentabilité réaliste."
      },
      {
        mistake: "Négliger la scalabilité du modèle : ça marche à petite échelle mais pas à grande",
        solution: "Testez mentalement votre modèle à 10x, 100x votre taille actuelle. Quelles parties ne passeraient pas à l'échelle ? Repensez-les dès maintenant."
      }
    ]
  },

  ressources_requises: {
    whatIsIt: "Un inventaire structuré de toutes les ressources nécessaires au lancement et au développement de votre projet : humaines, financières, matérielles, technologiques et immatérielles. Ce livrable vous permet d'anticiper vos besoins et de planifier vos levées de ressources.",
    whyCrucial: [
      "Évite les mauvaises surprises en identifiant les besoins critiques avant qu'ils ne deviennent bloquants",
      "Permet de dimensionner correctement vos besoins de financement initial et de croissance",
      "Aide à prioriser les ressources essentielles versus 'nice to have' pour optimiser votre trésorerie",
      "Facilite l'identification de partenaires stratégiques qui peuvent apporter des ressources clés"
    ],
    whenToUse: "Lors de la construction de votre business plan, avant de lancer une levée de fonds ou de solliciter des aides publiques. À mettre à jour à chaque phase de développement (MVP, lancement, scaling).",
    whatGoodContains: [
      "Ressources humaines : compétences clés requises, profils à recruter, timing et coût",
      "Ressources financières : besoin en fonds de roulement, investissements matériels, R&D",
      "Ressources technologiques : licences logicielles, infrastructures, outils de développement",
      "Ressources matérielles : locaux, équipements, stocks si pertinent",
      "Ressources immatérielles : certifications, brevets, marques, partenariats stratégiques",
      "Un phasage temporel des besoins : qu'est-ce qui est critique au lancement versus plus tard"
    ],
    commonPitfalls: [
      {
        mistake: "Vouloir tout avoir dès le départ et exploser son budget avant de générer des revenus",
        solution: "Adoptez une approche MVP : quelles sont les ressources strictement nécessaires pour lancer une première version et apprendre ? Le reste viendra après validation."
      },
      {
        mistake: "Oublier les coûts cachés : assurances, comptabilité, juridique, marketing",
        solution: "Ajoutez systématiquement 20-30% de budget 'divers et imprévus'. Les coûts indirects et administratifs sont souvent sous-estimés."
      },
      {
        mistake: "Recruter trop tôt ou les mauvais profils par manque de clarté sur les besoins",
        solution: "Avant chaque recrutement, documentez précisément : missions, livrables attendus, compétences critiques. Commencez par de la freelance pour tester avant de vous engager."
      }
    ]
  },

  vision_mission: {
    whatIsIt: "L'énoncé de votre vision à long terme (où voulez-vous emmener l'entreprise dans 5-10 ans) et de votre mission (votre raison d'être, l'impact que vous voulez créer). Ces deux éléments constituent votre boussole stratégique et fédèrent vos équipes autour d'un dessein commun.",
    whyCrucial: [
      "Donne un sens et une direction à long terme qui guide toutes vos décisions stratégiques",
      "Fédère vos équipes autour d'une ambition commune plus forte que le simple profit",
      "Attire les talents et partenaires qui partagent vos valeurs et votre vision du monde",
      "Différencie votre entreprise dans un monde où les consommateurs recherchent de plus en plus l'impact et le sens"
    ],
    whenToUse: "Dès la création de l'entreprise pour poser les fondations culturelles, puis à affiner lors de moments charnières (levées de fonds, pivots, phases de croissance). À communiquer régulièrement en interne et externe.",
    whatGoodContains: [
      "Une vision inspirante et ambitieuse qui projette l'entreprise dans 5-10 ans",
      "Une mission claire exprimant votre raison d'être et l'impact que vous voulez créer",
      "Vos valeurs fondamentales (3-5 maximum) qui guident vos comportements et décisions",
      "Des exemples concrets de comment ces valeurs se traduisent au quotidien",
      "L'alignement entre vision, mission et votre modèle économique",
      "Un énoncé mémorable que chaque membre de l'équipe peut s'approprier"
    ],
    commonPitfalls: [
      {
        mistake: "Utiliser des formulations creuses et génériques copiées d'autres entreprises",
        solution: "Soyez authentiques et spécifiques à votre histoire. Pourquoi VOUS avez créé cette entreprise ? Quel changement voulez-VOUS voir dans le monde ?"
      },
      {
        mistake: "Créer une vision déconnectée de la réalité opérationnelle et économique",
        solution: "Assurez-vous que votre vision est ambitieuse mais atteignable, et qu'elle s'appuie sur un modèle économique viable. Idéalisme oui, naïveté non."
      },
      {
        mistake: "Afficher des valeurs qui ne sont pas incarnées dans les pratiques quotidiennes",
        solution: "Chaque valeur doit se traduire par des comportements observables et des décisions concrètes. Sinon, c'est du washing qui détruit la confiance."
      }
    ]
  },

  mini_swot: {
    whatIsIt: "Une analyse stratégique synthétique identifiant vos Forces, Faiblesses, Opportunités et Menaces dans le contexte de votre projet. Cet outil de diagnostic rapide vous permet d'avoir une vision objective de votre positionnement stratégique.",
    whyCrucial: [
      "Fournit une photographie honnête de votre situation pour prendre des décisions éclairées",
      "Identifie les leviers prioritaires sur lesquels investir (forces à amplifier, opportunités à saisir)",
      "Révèle les vulnérabilités à adresser avant qu'elles ne deviennent critiques",
      "Facilite les discussions stratégiques avec vos associés, advisors ou investisseurs"
    ],
    whenToUse: "À chaque moment charnière : lancement, pivot, levée de fonds, entrée sur un nouveau marché. Idéalement à réaliser en atelier collectif pour croiser les perspectives et éviter les angles morts.",
    whatGoodContains: [
      "3-5 forces internes réellement différenciantes (pas des généralités)",
      "3-5 faiblesses objectives à adresser avec honnêteté",
      "3-5 opportunités externes concrètes et actionnables à court-moyen terme",
      "3-5 menaces externes réalistes avec leur probabilité et impact potentiel",
      "Pour chaque élément, des preuves factuelles ou exemples concrets",
      "Des stratégies d'action : comment capitaliser sur les forces/opportunités, comment mitiger les faiblesses/menaces"
    ],
    commonPitfalls: [
      {
        mistake: "Rester dans les généralités vagues et non actionnables",
        solution: "Soyez spécifiques : au lieu de 'bonne équipe', écrivez 'CTO avec 10 ans d'expérience en IA chez Google'. Le SWOT doit permettre de passer à l'action."
      },
      {
        mistake: "Minimiser les faiblesses et menaces par optimisme ou déni",
        solution: "L'honnêteté est votre meilleure alliée. Reconnaître une faiblesse vous permet de la combler. L'ignorer la transforme en bombe à retardement."
      },
      {
        mistake: "Confondre interne (forces/faiblesses) et externe (opportunités/menaces)",
        solution: "Forces/Faiblesses = ce que VOUS contrôlez (équipe, produit, capital). Opportunités/Menaces = contexte externe (marché, concurrence, régulation)."
      }
    ]
  },

  cadre_juridique: {
    whatIsIt: "Une analyse du cadre réglementaire et juridique applicable à votre activité, incluant la forme juridique optimale, les obligations légales à respecter, les certifications nécessaires et les risques juridiques à anticiper. Ce livrable sécurise votre lancement et votre développement.",
    whyCrucial: [
      "Évite les erreurs coûteuses de non-conformité qui peuvent bloquer votre activité",
      "Optimise votre structure juridique pour minimiser la fiscalité et protéger vos intérêts",
      "Anticipe les obligations réglementaires sectorielles (RGPD, certifications, licences)",
      "Protège votre propriété intellectuelle et vos innovations"
    ],
    whenToUse: "Avant la création officielle de l'entreprise pour choisir la bonne structure juridique. À actualiser lors de changements majeurs : levée de fonds, expansion internationale, lancement de nouvelles activités réglementées.",
    whatGoodContains: [
      "La forme juridique recommandée avec justification (SAS, SARL, SASU, etc.)",
      "Les obligations légales et réglementaires spécifiques à votre secteur",
      "Les certifications ou agréments nécessaires pour exercer votre activité",
      "La stratégie de protection de votre propriété intellectuelle (marques, brevets, droits d'auteur)",
      "Les principaux risques juridiques identifiés et comment les mitiger",
      "Les contrats types à prévoir : clients, fournisseurs, partenaires, employés"
    ],
    commonPitfalls: [
      {
        mistake: "Choisir sa forme juridique sur des critères superficiels ou par mimétisme",
        solution: "Faites-vous accompagner par un expert-comptable et un avocat spécialisé en création d'entreprise. Le choix dépend de votre situation personnelle, vos objectifs et votre activité."
      },
      {
        mistake: "Négliger la protection de votre propriété intellectuelle dès le départ",
        solution: "Déposez vos marques, sécurisez vos noms de domaine, documentez vos innovations. C'est plus facile et moins coûteux de protéger en amont que de corriger après."
      },
      {
        mistake: "Sous-estimer la complexité réglementaire de certains secteurs (santé, finance, éducation)",
        solution: "Identifiez très tôt les réglementations applicables et intégrez les délais et coûts de conformité dans votre planning et budget."
      }
    ]
  },

  ma_success_story: {
    whatIsIt: "Le récit structuré de votre parcours entrepreneurial, des origines de votre projet jusqu'à aujourd'hui, mettant en avant les étapes clés, les obstacles surmontés et les apprentissages. C'est votre storytelling personnel qui humanise votre projet et crée de la connexion.",
    whyCrucial: [
      "Crée une connexion émotionnelle avec vos interlocuteurs (investisseurs, clients, partenaires)",
      "Démontre votre résilience et votre capacité à pivoter face aux difficultés",
      "Humanise votre projet en montrant les personnes et les motivations derrière l'entreprise",
      "Fournit un contenu authentique et différenciant pour votre communication"
    ],
    whenToUse: "Pour vos présentations investisseurs, votre site web (page 'À propos'), vos contenus marketing, vos prises de parole publiques. À construire une fois puis à enrichir au fil de votre développement.",
    whatGoodContains: [
      "Le déclencheur : pourquoi et comment vous avez eu l'idée de ce projet",
      "Les obstacles et échecs rencontrés, avec honnêteté et vulnérabilité",
      "Les pivots et apprentissages qui ont transformé votre approche",
      "Les victoires et jalons marquants qui prouvent votre traction",
      "Les personnes clés qui vous ont aidé en chemin (mentors, premiers clients)",
      "Votre vision pour la suite : où allez-vous emmener le projet maintenant"
    ],
    commonPitfalls: [
      {
        mistake: "Créer un récit trop lisse qui cache les difficultés et sonne inauthentique",
        solution: "Les histoires les plus inspirantes incluent les échecs et les doutes. Votre vulnérabilité est une force qui crée de la connexion et de la crédibilité."
      },
      {
        mistake: "Se perdre dans les détails techniques au détriment de l'émotion et du sens",
        solution: "Racontez POURQUOI vous faites ce que vous faites avant COMMENT vous le faites. L'émotion et la mission créent l'adhésion, les features viennent après."
      },
      {
        mistake: "Faire de votre story un monologue égocentré sans lien avec votre audience",
        solution: "Tissez des liens avec l'expérience de votre audience : en quoi votre parcours résonne avec leurs défis ? Qu'est-ce qu'ils peuvent en retirer ?"
      }
    ]
  }
};
