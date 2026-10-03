/**
 * Localization (i18n) Manager for Variable Font Controller
 * Supports Armenian (hy) and English (en).
 * Default is Armenian (hy). Automatically selects English (en) if IP is outside
 * Armenia and Windows OS locale is not Armenian, while respecting manual selection.
 * Follows K&R / 1TBS brace formatting.
 */

const TRANSLATIONS = {
    hy: {
        // App Header & Selection
        appTitle: 'Variable Controller',
        syncTitle: 'Թարմացնել ընտրվածը Illustrator-ից',
        langToggleTitle: 'Փոխել լեզուն / Switch Language',
        themeToggleTitle: 'Փոխել ոճը (Սև / Սպիտակ / Auto ըստ Illustrator-ի)',
        noDoc: 'Բացված փաստաթուղթ չկա',
        idle: 'Illustrator-ը պարապուրդի մեջ է',
        noSelection: 'Ոչինչ ընտրված չէ',
        deselected: 'Ապանշված (Արժեքները պահպանված են)',
        staticFontNotice: 'Ոչ փոփոխական տառատեսակ (Ստատիկ)',
        staticFont: 'Ստատիկ տառատեսակ',
        varFont: 'Փոփոխական տառատեսակ',
        charsSelected: '{count} նիշ ընտրված է',
        itemsSelected: '{count} առարկա ընտրված է',
        vectorObjects: 'Դինամիկ վեկտորային օբյեկտ(ներ)',

        // Tabs
        tabSliders: 'Սահիչներ',
        tabGraph: 'Արվեստանոց',
        tabDesignSpace: '2չափ',

        // Mode 1: Sliders & Curves
        weightPresets: 'Քաշի նախադրվածքներ՝',
        resetRegularAll: 'Վերականգնել Regular (400 / 100)',
        resetAxisDefault: 'Վերականգնել լռելյայնը ({val})',
        toggleCurveDrawer: 'Բացել/փակել {name}-ի բաշխման կորի դարակը',
        curveBtn: 'Կոր',
        easingDistFor: 'Բաշխման կոր {name}-ի համար',
        mapAcrossChars: 'Տարածել տառերի վրա',
        mapAcrossItems: 'Տարածել առարկաների վրա',
        p0Start: 'P0 (Սկիզբ)',
        p1Coord: 'P1 (X, Y)',
        p2Coord: 'P2 (X, Y)',
        p3End: 'P3 (Վերջ)',

        // Presets
        presetLinear: 'Գծային',
        presetEaseIn: 'Ease-In',
        presetEaseOut: 'Ease-Out',
        presetSCurve: 'S-Կոր',
        presetBell: 'Զանգ (Bell)',
        presetValley: 'Հովիտ (Valley)',
        presetWave: 'Ալիք (Wave)',
        presetMultiWave: 'Բազմալիք (Ripple)',
        presetSteps: 'Աստիճանաձև (Steps)',
        presetBounce: 'Ցատկ (Bounce)',
        presetElastic: 'Առաձգական (Elastic)',
        presetPeak: 'Սայր (Peak)',
        presetPulse: 'Զարկ (Pulse)',
        presetExpo: 'Էքսպոնենտ (Expo)',

        // Custom Presets & Import/Export
        createPresetBtn: 'Ստեղծել Preset',
        createPresetTitle: 'Ստեղծել նոր preset ընթացիկ կորից',
        savePresetBtn: 'Պահպանել Preset',
        savePresetTitle: 'Պահպանել ընթացիկ կորը որպես սեփական նախադրվածք',
        exportPresetsBtn: 'Արտածել',
        exportPresetsTitle: 'Արտածել (Export) բոլոր preset-ները JSON ֆայլի տեսքով',
        importPresetsBtn: 'Ներածել',
        importPresetsTitle: 'Ներածել (Import) preset-ներ JSON ֆայլից',
        deleteAllPresetsBtn: 'Ջնջել Բոլորը',
        deleteAllPresetsTitle: 'Ջնջել բոլոր նախադրվածքները',
        customPresetsLabel: 'Իմ նախադրվածքները (Custom Presets)՝',
        promptPresetName: 'Մուտքագրեք Preset-ի անունը՝',
        presetNamePlaceholder: 'Preset-ի անունը...',
        defaultPresetName: 'Իմ Կորը',
        noCustomPresets: 'Պահպանված նախադրվածքներ չկան',
        deletePresetTitle: 'Ջնջել այս նախադրվածքը',
        saveBtn: 'Պահպանել',
        cancelBtn: 'Չեղարկել',
        presetsImportedSuccess: 'Հաջողությամբ ներածվել է {count} preset',
        presetsImportError: 'Սխալ JSON ֆայլի ձևաչափ',

        // Delete Confirmation Modal
        confirmDeletePresetTitle: 'Ջնջել Նախադրվածքը',
        confirmDeletePresetMsg: 'Վստա՞հ եք, որ ցանկանում եք ջնջել «{name}» նախադրվածքը:',
        confirmDeleteAllPresetsTitle: 'Ջնջե՞լ բոլոր նախադրվածքները',
        confirmDeleteAllPresetsMsg: 'Վստա՞հ եք, որ ցանկանում եք ջնջել բոլոր նախադրվածքները։ Այս գործողությունը կհեռացնի ձեր բոլոր պահպանված preset-ները։',
        confirmDeleteFolderTitle: 'Ջնջել Պանակը',
        confirmDeleteFolderMsg: 'Վստա՞հ եք, որ ցանկանում եք ջնջել «{name}» պանակը: Դրա միջի preset-ները կտեղափոխվեն «Ընդհանուր» պանակ:',
        confirmDeleteBtn: 'Ջնջել',

        // Preset Folders & Groups
        foldersLabel: 'Պանակներ՝',
        newFolderBtn: 'Նոր Պանակ',
        newFolderTitle: 'Ստեղծել նոր պանակ preset-ների համար',
        newFolderPlaceholder: 'Պանակի անունը...',
        folderGeneral: 'Ընդհանուր',
        folderBuiltIn: 'Հիմնական',
        folderShapes: 'Կորեր',
        folderDynamics: 'Դինամիկ',
        folderCustom: 'Իմ Պանակը',
        allFolders: 'Բոլորը',
        folderSelectLabel: 'Պանակ՝',
        deleteFolderTitle: 'Ջնջել այս պանակը',

        // Window & Panels Menu
        windowMenuBtn: 'Փեղկեր',
        windowMenuTitle: 'Կառավարել փեղկերը',
        panelCurves: 'Կորերի Շերտեր',
        panelToolbar: 'Առանցքի Կարգավորումներ',
        panelCanvas: 'Սպլայն Կտավ',
        panelPoints: 'Կետերի Կառավարում',
        panelPresets: 'Նախադրվածքներ և Պանակներ',
        panelPreview: 'Բաշխման Նախադիտում',
        resetLayoutBtn: 'Վերականգնել Դիրքերը',
        moveUpTitle: 'Տեղափոխել վերև',
        moveDownTitle: 'Տեղափոխել ներքև',
        closePanelTitle: 'Փակել փեղկը',
        collapsePanelTitle: 'Կոծկել փեղկը',
        expandPanelTitle: 'Բացել փեղկը',
        collapseFolderTitle: 'Կոծկել պանակը',
        expandFolderTitle: 'Բացել պանակը',

        // Weight presets
        presetThin: 'Thin (100)',
        presetLight: 'Light (300)',
        presetRegular: 'Regular (400)',
        presetBold: 'Bold (700)',
        presetBlack: 'Black (900)',

        // Mode 2: Graph Studio
        curvesTitle: 'Կորեր՝',
        addCurveBtn: 'Ավելացնել Կոր',
        addCurveTitle: 'Ավելացնել նոր կոր այս կտավում',
        allAxesAdded: 'Բոլոր առանցքներն արդեն ավելացված են',
        selectAxisToAdd: 'Ընտրել առանցք...',
        disableCurve: 'Անջատել կորը',
        enableCurve: 'Միացնել կորը',
        deleteCurve: 'Ջնջել կորը',
        activeCurveAxis: 'Ակտիվ կորի առանցք՝',
        swapAxes: 'Փոխանակել',
        changeOrSwapAxisTitle: 'Փոխել կամ փոխանակել առանցքը',
        duplicateCurve: 'Կրկնօրինակել կորը այլ առանցքի վրա',
        copyCurveTo: 'Պատճենել կորը դեպի...',
        selectTargetAxis: 'Ընտրել առանցք...',
        axisSwapped: 'Կորի առանցքները փոխանակվեցին ({axis1} ⇄ {axis2})',
        axisChanged: 'Կորի առանցքը փոխվեց՝ {axis}',
        mapAcross: 'Տարածել՝',
        optCharacters: 'Տառերի վրա',
        optItems: 'Ընտրված առարկաների',
        annMax: '1.0 (Առավ.)',
        annMin: '0.0 (Նվազ.)',
        annStart: 'Սկիզբ [0]',
        annEnd: 'Վերջ [N]',
        pointsLabel: 'Կետեր՝',
        pointDetailsLabel: 'Մանրամասներ՝',
        pointActionsLabel: 'Գործողություններ՝',
        undoPointBtn: 'Հետարկել',
        undoPointTitle: 'Հետարկել կետերի փոփոխությունը (Ctrl+Z)',
        redoPointBtn: 'Վերարկել',
        redoPointTitle: 'Վերարկել կետերի փոփոխությունը (Ctrl+Y / Ctrl+Shift+Z)',
        addPointBtn: 'Ավելացնել Կետ',
        addPointTitle: 'Ավելացնել միջանկյալ կետ',
        delPointBtn: 'Հեռացնել',
        delPointTitle: 'Հեռացնել ընտրված կետը',
        toggleLinkHandlesTitle: 'Ապակապել / Կապել լծակները (Broken vs Smooth Handles)',
        pointLinked: 'Կապված',
        pointUnlinked: 'Ապակապ',
        instructionsHint: 'Կրկնակի կտտոց՝ ավելացնել/հեռացնել կետ, լծակին՝ կոտրել/սահունացնել: Alt + Քաշել լծակը՝ ապակապել: Alt + Աջ կտտոց՝ վերացնել լծակները:',
        handleSmoothTip: 'Լծակ (Կապված / Սահուն)',
        handleBrokenTip: 'Լծակ (Ապակապված / Կոտրված)',
        pointStraight: 'Ուղիղ / Առանց լծակների',
        pointBroken: 'Ապակապված (Կոտրված)',
        pointSmooth: 'Կապված (Սահուն)',
        curvePresetsLabel: 'Կորի նախադրվածքներ (Ակտիվ կոր)՝',
        distributionPrefix: 'Բաշխում՝',
        charDistribution: 'Տառերի բաշխում',
        itemDistribution: 'Առարկաների բաշխում',
        elementsCount: '{count} տարր',
        charactersCount: '{count} տառ',
        itemsCount: '{count} առարկա',

        // Mode 3: 2D Design Space
        xAxisLabel: 'X առանցք՝',
        yAxisLabel: 'Y առանցք՝',
        snapRegular: 'Regular',
        snapRegularTitle: 'Վերականգնել Regular լռելյայնը (Weight 400, Width 100)',
        snapCenter: 'Կենտրոն',
        snapCenterTitle: 'Տեղափոխել կենտրոն (0.5, 0.5)',

        // Non-Variable Font & Empty Selection
        nonVarHeading: 'Տառատեսակը փոփոխական (Variable Font) չէ',
        nonVarBody: 'Ընտրված տառատեսակը չունի OpenType Variable Font առանցքներ։<br>Խնդրում ենք Illustrator-ում ընտրել փոփոխական տառատեսակ (օր․՝ ArTarumianAzdVar, Bahnschrift, Acumin Variable Concept և այլն)։',
        selectTextToEdit: 'Ընտրեք տեքստ խմբագրելու համար',
        docTextFramesTitle: 'Փաստաթղթի տեքստերը՝',
        noTextFramesInDoc: 'Փաստաթղթում տեքստային շերտեր չկան',
        clickToSelectInDoc: 'Կտտացրեք փաստաթղթում ընտրելու համար',
        dragToReorder: 'Քաշեք տեղափոխելու համար',
        distBarLetterTip: 'Տառ {char} (#{idx})՝ {axis} = {val}',
        distLimitExceeded: 'Բաշխիչ գծերը չեն կարող աշխատել, քանի որ տառերի քանակը շատ է (առավելագույնը 128 տառ, ընտրված է {count})։',
        maxLimitNotice: 'Առավելագույնը 128',
        variableFontTag: 'Փոփոխական',
        staticFontTag: 'Ստատիկ',

        // GitHub Updates
        updatesBtn: 'Թարմացումներ',
        updatesTitle: 'Ստուգել Github թարմացումները',
        checkingUpdates: 'Ստուգվում են թարմացումները...',
        updateCheckFailed: 'Չհաջողվեց կապվել Github-ի հետ',
        newVersionAvailable: 'Հասանելի է նոր տարբերակ՝',
        upToDate: 'Դուք օգտագործում եք վերջին տարբերակը',
        updateNowBtn: 'Թարմացնել Հիմա',
        checkAgainBtn: 'Ստուգել Կրկին',
        downloadingUpdate: 'Ներբեռնվում է թարմացումը...',
        updateCompletedReload: 'Թարմացումը կատարվեց։ Վերբեռնվում է...',
        updateZipDownloaded: 'Թարմացումը ներբեռնվեց։ Գործարկեք update.bat-ը ավարտելու համար։',

        // Axis Names Translation
        axis_wght: 'Քաշ (Weight)',
        axis_wdth: 'Լայնություն (Width)',
        axis_slnt: 'Թեքություն (Slant)',
        axis_ital: 'Շեղություն (Italic)',
        axis_opsz: 'Օպտիկական չափ (Optical Size)',

        // Welcome & Interactive Tutorial (Արվեստանոց)
        welcomeStudioTitle: 'Բարի գալուստ Արվեստանոց',
        welcomeStudioDesc: 'Այստեղ կարող եք ստեղծել և կառավարել տառատեսակի բազմառանցքային կորեր, բաշխել փոփոխականությունը տառերի կամ առարկաների վրա, ստեղծել preset-ներ և պանակներ։',
        btnStartTour: 'Սկսել ուսուցումը',
        btnStartWithoutTour: 'Սկսել առանց ուսուցման',
        tourStepIndicator: 'Քայլ {current} / {total}',
        tourNext: 'Հաջորդ →',
        tourPrev: '← Հետ',
        tourFinish: 'Ավարտել',
        tourSkip: 'Բաց թողնել',
        restartTourBtn: 'Ուսուցում (Քայլ առ քայլ)',
        tourStep1Title: '1. Կորերի Շերտեր',
        tourStep1Desc: 'Այստեղ կարող եք տեսնել ակտիվ կորերը։ «Ավելացնել Կոր» կոճակով կարող եք ավելացնել տառատեսակի այլ առանցքներ (օր.՝ Weight, Width, Slant), աչքի կոճակով միացնել/անջատել դրանք կամ ջնջել։',
        tourStep2Title: '2. Առանցքի Կարգավորումներ',
        tourStep2Desc: 'Ընտրեք ակտիվ կորի առանցքը և բաշխման թիրախը՝ «Տառերի վրա» (տեքստի յուրաքանչյուր նիշ ստանում է իր չափը) կամ «Ընտրված առարկաների»։',
        tourStep3Title: '3. Սպլայն Կտավ և Բաշխում',
        tourStep3Desc: 'Ինտերակտիվ Բեզյե կտավ և բաշխման նախադիտում։ Քաշեք կետերը և լծակները ձևը փոխելու համար։ Մկնիկը պահեք բաշխման գծերի վրա՝ դեպի կորագիծ զուգահեռ պրոյեկցիան և ճշգրիտ թիվը տեսնելու համար։',
        tourStep4Title: '4. Կետերի Կառավարում',
        tourStep4Desc: 'Արագ անցեք կետերի միջև P0, P1 չիպերով, մուտքագրեք ճշգրիտ X/Y կոորդինատներ, ավելացրեք կամ հեռացրեք կետեր։ Հետարկեք կամ վերարկեք փոփոխությունները (Ctrl+Z / Ctrl+Y)։',
        tourStep5Title: '5. Նախադրվածքներ և Պանակներ',
        tourStep5Desc: 'Ընտրեք պատրաստի կորեր (S-Կոր, Ալիք, Ցատկ և այլն) կամ ստեղծեք ձերը («Ստեղծել Preset»)։ Խմբավորեք պանակներում և արտածեք/ներածեք JSON ֆայլերով։',
        tourStep6Title: '6. Փեղկերի Կառավարում',
        tourStep6Desc: 'Սեղմեք ցանկացած փեղկի վերնագրին՝ այն կոծկելու համար։ Քաշեք բռնակից՝ վերադասավորելու համար։ Կարող եք փակել, իսկ վերևի «Փեղկեր» ցանկից՝ նորից միացնել փակված փեղկերը։',

        // GitHub Updates
        updateModalTitle: 'Խրվակի Թարմացումներ',
        currentVersionLabel: 'Ընթացիկ՝',
        latestVersionLabel: 'Վերջինը՝',
        checkingUpdates: 'Ստուգվում են թարմացումները...',
        newVersionAvailable: 'Հասանելի է նոր թարմացում՝',
        upToDate: 'Դուք օգտագործում եք վերջին տարբերակը',
        updateNowBtn: 'Թարմացնել Հիմա',
        checkAgainBtn: 'Ստուգել Կրկին',
        downloadingUpdate: 'Ներբեռնվում և տեղադրվում է թարմացումը...',
        updateCompletedReload: 'Թարմացումը բարեհաջող տեղադրվեց: Վերագործարկվում է...',
        updateCheckFailed: 'Չհաջողվեց կապ հաստատել GitHub-ի հետ'
    },
    en: {
        // App Header & Selection
        appTitle: 'Variable Controller',
        syncTitle: 'Refresh Selection from Illustrator',
        langToggleTitle: 'Switch Language / Փոխել լեզուն',
        themeToggleTitle: 'Switch Theme (Dark / Light / Auto by Illustrator)',
        noDoc: 'No Document Open',
        idle: 'Illustrator Idle',
        noSelection: 'No Selection',
        deselected: 'Deselected (Values Retained)',
        staticFontNotice: 'Non-Variable Font (Static)',
        staticFont: 'Static Font',
        varFont: 'Variable Font',
        charsSelected: '{count} Character(s) Selected',
        itemsSelected: '{count} Item(s) Selected',
        vectorObjects: 'Dynamic Vector Object(s)',

        // Tabs
        tabSliders: 'Sliders & Curves',
        tabGraph: 'Studio',
        tabDesignSpace: '2D Space',

        // Mode 1: Sliders & Curves
        weightPresets: 'Weight Presets:',
        resetRegularAll: 'Reset to Regular (400 / 100)',
        resetAxisDefault: 'Reset to default ({val})',
        toggleCurveDrawer: 'Toggle Bézier Easing Curve for {name}',
        curveBtn: 'Curve',
        easingDistFor: 'Bézier Easing Distribution for {name}',
        mapAcrossChars: 'Map across characters',
        mapAcrossItems: 'Map across items',
        p0Start: 'P0 (Start)',
        p1Coord: 'P1 (X, Y)',
        p2Coord: 'P2 (X, Y)',
        p3End: 'P3 (End)',

        // Presets
        presetLinear: 'Linear',
        presetEaseIn: 'Ease-In',
        presetEaseOut: 'Ease-Out',
        presetSCurve: 'S-Curve',
        presetBell: 'Bell',
        presetValley: 'Valley',
        presetWave: 'Wave',
        presetMultiWave: 'Multi-Wave',
        presetSteps: 'Steps',
        presetBounce: 'Bounce',
        presetElastic: 'Elastic',
        presetPeak: 'Peak',
        presetPulse: 'Pulse',
        presetExpo: 'Exponential',

        // Custom Presets & Import/Export
        createPresetBtn: 'Create Preset',
        createPresetTitle: 'Create new preset from current curve',
        savePresetBtn: 'Save Preset',
        savePresetTitle: 'Save current curve as custom preset',
        exportPresetsBtn: 'Export',
        exportPresetsTitle: 'Export all presets as a JSON file',
        importPresetsBtn: 'Import',
        importPresetsTitle: 'Import presets from a JSON file',
        deleteAllPresetsBtn: 'Delete All',
        deleteAllPresetsTitle: 'Delete all presets',
        customPresetsLabel: 'Custom Presets:',
        promptPresetName: 'Enter preset name:',
        presetNamePlaceholder: 'Preset name...',
        defaultPresetName: 'My Curve',
        noCustomPresets: 'No custom presets saved',
        deletePresetTitle: 'Delete this preset',
        saveBtn: 'Save',
        cancelBtn: 'Cancel',
        presetsImportedSuccess: 'Successfully imported {count} preset(s)',
        presetsImportError: 'Invalid JSON presets file',

        // Delete Confirmation Modal
        confirmDeletePresetTitle: 'Delete Preset',
        confirmDeletePresetMsg: 'Are you sure you want to delete preset "{name}"?',
        confirmDeleteAllPresetsTitle: 'Delete All Presets?',
        confirmDeleteAllPresetsMsg: 'Are you sure you want to delete all presets? This will permanently remove all your saved presets.',
        confirmDeleteFolderTitle: 'Delete Folder',
        confirmDeleteFolderMsg: 'Are you sure you want to delete folder "{name}"? Presets inside will be moved to General.',
        confirmDeleteBtn: 'Delete',

        // Preset Folders & Groups
        foldersLabel: 'Folders:',
        newFolderBtn: 'New Folder',
        newFolderTitle: 'Create a new folder for presets',
        newFolderPlaceholder: 'Folder name...',
        folderGeneral: 'General',
        folderBuiltIn: 'Basic',
        folderShapes: 'Curves',
        folderDynamics: 'Dynamics',
        folderCustom: 'My Folder',
        allFolders: 'All',
        folderSelectLabel: 'Folder:',
        deleteFolderTitle: 'Delete this folder',

        // Window & Panels Menu
        windowMenuBtn: 'Shutters',
        windowMenuTitle: 'Manage Shutters',
        panelCurves: 'Curve Layers',
        panelToolbar: 'Axis Settings',
        panelCanvas: 'Spline Canvas',
        panelPoints: 'Points Control',
        panelPresets: 'Presets & Folders',
        panelPreview: 'Distribution Preview',
        resetLayoutBtn: 'Reset Layout',
        moveUpTitle: 'Move up',
        moveDownTitle: 'Move down',
        closePanelTitle: 'Close shutter',
        collapsePanelTitle: 'Collapse shutter',
        expandPanelTitle: 'Expand shutter',
        collapseFolderTitle: 'Collapse folder',
        expandFolderTitle: 'Expand folder',

        // Weight presets
        presetThin: 'Thin (100)',
        presetLight: 'Light (300)',
        presetRegular: 'Regular (400)',
        presetBold: 'Bold (700)',
        presetBlack: 'Black (900)',

        // Mode 2: Graph Studio
        curvesTitle: 'Curves:',
        addCurveBtn: 'Add Curve',
        addCurveTitle: 'Add another curve to this canvas',
        allAxesAdded: 'All font axes are already added',
        selectAxisToAdd: 'Select axis...',
        disableCurve: 'Disable curve',
        enableCurve: 'Enable curve',
        deleteCurve: 'Delete curve',
        activeCurveAxis: 'Active Curve Axis:',
        swapAxes: 'Swap',
        changeOrSwapAxisTitle: 'Change or swap axis',
        duplicateCurve: 'Duplicate curve to another axis',
        copyCurveTo: 'Copy curve to...',
        selectTargetAxis: 'Select axis...',
        axisSwapped: 'Curve axes swapped ({axis1} ⇄ {axis2})',
        axisChanged: 'Curve axis changed to {axis}',
        mapAcross: 'Map across:',
        optCharacters: 'Characters',
        optItems: 'Selected Items',
        annMax: '1.0 (Max)',
        annMin: '0.0 (Min)',
        annStart: 'Start [0]',
        annEnd: 'End [N]',
        pointsLabel: 'Points:',
        pointDetailsLabel: 'Details:',
        pointActionsLabel: 'Actions:',
        undoPointBtn: 'Undo',
        undoPointTitle: 'Undo point changes (Ctrl+Z)',
        redoPointBtn: 'Redo',
        redoPointTitle: 'Redo point changes (Ctrl+Y / Ctrl+Shift+Z)',
        addPointBtn: 'Add Point',
        addPointTitle: 'Add intermediate point',
        delPointBtn: 'Delete',
        delPointTitle: 'Delete selected point',
        toggleLinkHandlesTitle: 'Toggle Link / Unlink Handles (Broken vs Smooth)',
        pointLinked: 'Linked',
        pointUnlinked: 'Unlinked',
        instructionsHint: 'Double-click to add/delete point, on handle to break/smooth. Alt + Drag handle to unlink. Alt + Right-click to remove handles.',
        handleSmoothTip: 'Handle (Linked / Smooth)',
        handleBrokenTip: 'Handle (Unlinked / Broken)',
        pointStraight: 'Straight / No Handles',
        pointBroken: 'Unlinked (Broken)',
        pointSmooth: 'Linked (Smooth)',
        curvePresetsLabel: 'Curve Presets (Active Curve):',
        distributionPrefix: 'Distribution:',
        charDistribution: 'Character Distribution',
        itemDistribution: 'Item Distribution',
        elementsCount: '{count} elements',
        charactersCount: '{count} characters',
        itemsCount: '{count} items',

        // Mode 3: 2D Design Space
        xAxisLabel: 'X-Axis:',
        yAxisLabel: 'Y-Axis:',
        snapRegular: 'Regular',
        snapRegularTitle: 'Snap to Regular Defaults (Weight 400, Width 100)',
        snapCenter: 'Center',
        snapCenterTitle: 'Snap to Center (0.5, 0.5)',

        // Non-Variable Font & Empty Selection
        nonVarHeading: 'Font is not a Variable Font',
        nonVarBody: 'The selected font does not contain OpenType Variable Font axes.<br>Please select text with a Variable Font in Illustrator (such as ArTarumianAzdVar, Bahnschrift, Acumin Variable Concept, etc.).',
        selectTextToEdit: 'Select text to edit',
        docTextFramesTitle: 'Document Text Frames:',
        noTextFramesInDoc: 'No text frames found in document',
        clickToSelectInDoc: 'Click to select in document',
        dragToReorder: 'Drag to reorder',
        distBarLetterTip: 'Letter {char} (#{idx}): {axis} = {val}',
        distLimitExceeded: 'Distribution bars cannot work because character count exceeds the limit (maximum 128 characters, selected: {count}).',
        maxLimitNotice: 'Max 128',
        variableFontTag: 'Variable Font',
        staticFontTag: 'Static Font',

        // GitHub Updates
        updatesBtn: 'Updates',
        updatesTitle: 'Check for GitHub updates',
        checkingUpdates: 'Checking for updates...',
        updateCheckFailed: 'Could not reach GitHub repository',
        newVersionAvailable: 'New version available:',
        upToDate: 'You are using the latest version',
        updateNowBtn: 'Update Plugin Now',
        checkAgainBtn: 'Check Again',
        downloadingUpdate: 'Downloading update...',
        updateCompletedReload: 'Update completed! Reloading...',
        updateZipDownloaded: 'Update downloaded. Run update.bat to apply.',

        // Axis Names Translation
        axis_wght: 'Weight',
        axis_wdth: 'Width',
        axis_slnt: 'Slant',
        axis_ital: 'Italic',
        axis_opsz: 'Optical Size',

        // Welcome & Interactive Tutorial (Studio)
        welcomeStudioTitle: 'Welcome to the Studio',
        welcomeStudioDesc: 'Here you can visually craft and control multi-axis variable font curves, distribute variation across letters or items, create custom presets, and organize them into folders.',
        btnStartTour: 'Start Tutorial',
        btnStartWithoutTour: 'Start without tutorial',
        tourStepIndicator: 'Step {current} of {total}',
        tourNext: 'Next →',
        tourPrev: '← Back',
        tourFinish: 'Finish',
        tourSkip: 'Skip',
        restartTourBtn: 'Tutorial (Step-by-step)',
        tourStep1Title: '1. Curve Layers',
        tourStep1Desc: 'View and manage active curves. Click "+ Add Curve" to add more axes from your font (e.g. Weight, Width, Slant), toggle curve visibility with the eye icon, or remove layers.',
        tourStep2Title: '2. Axis Settings',
        tourStep2Desc: 'Select the active curve axis and set the distribution target: "Map across characters" (each character gets its own variation) or "Selected items".',
        tourStep3Title: '3. Spline Canvas & Distribution',
        tourStep3Desc: 'Interactive Bézier canvas and live distribution preview. Drag anchor points and handles to shape. Hover over distribution bars to see parallel projection lines to the curve and computed values.',
        tourStep4Title: '4. Points Control',
        tourStep4Desc: 'Quickly switch between points using P0, P1 chips, enter precise X/Y values, add or remove points, and Undo/Redo changes (Ctrl+Z / Ctrl+Y).',
        tourStep5Title: '5. Presets & Folders',
        tourStep5Desc: 'Choose from rich built-in presets (S-Curve, Wave, Bounce, etc.) or save your own ("Create Preset"). Group them into custom folders and export/import as JSON files.',
        tourStep6Title: '6. Shutters Management',
        tourStep6Desc: 'Click any shutter header to collapse/expand. Drag the handle to reorder shutters. Use Close to hide shutters, and restore them anytime from the top "Shutters" menu.',

        // GitHub Updates
        updateModalTitle: 'Plugin Updates',
        currentVersionLabel: 'Current:',
        latestVersionLabel: 'Latest:',
        checkingUpdates: 'Checking for updates...',
        newVersionAvailable: 'New version available:',
        upToDate: 'You are using the latest version.',
        updateNowBtn: 'Update Now',
        checkAgainBtn: 'Check Again',
        downloadingUpdate: 'Downloading and applying update...',
        updateCompletedReload: 'Update completed! Reloading extension...',
        updateCheckFailed: 'Could not connect to GitHub repository'
    }
};

class I18nManager {
    constructor() {
        this.currentLang = 'hy'; // Default is Armenian
        this.listeners = [];
        this.translations = TRANSLATIONS;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) {
            return;
        }
        this.currentLang = await this.detectLanguage();
        this.isInitialized = true;
        this.notify();
    }

    async detectLanguage() {
        // 1. Check if user already manually selected a language
        const saved = localStorage.getItem('app_language');
        if (saved === 'hy' || saved === 'en') {
            return saved;
        }

        // 2. Default is Armenian
        let detected = 'hy';

        // 3. Check Windows OS / system locale
        const sysLangs = (navigator.languages || [navigator.language || '']).map((l) => String(l).toLowerCase());
        const isWindowsArmenian = sysLangs.some((l) => l.startsWith('hy') || l.includes('arm'));

        // 4. Check IP location
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2200);

            let country = null;
            try {
                const res = await fetch('https://api.country.is/', { signal: controller.signal });
                if (res.ok) {
                    const data = await res.json();
                    country = data.country;
                }
            } catch (e1) {
                try {
                    const res2 = await fetch('https://ipwho.is/', { signal: controller.signal });
                    if (res2.ok) {
                        const data2 = await res2.json();
                        country = data2.country_code;
                    }
                } catch (e2) {}
            } finally {
                clearTimeout(timeoutId);
            }

            // Rule: If IP is outside Armenia AND Windows is not Armenian -> English
            if (country && String(country).toUpperCase() !== 'AM' && !isWindowsArmenian) {
                detected = 'en';
            }
        } catch (err) {
            console.warn('Geo-detection skipped or failed, using default Armenian:', err);
        }

        return detected;
    }

    t(key, params = {}) {
        const lang = this.currentLang || 'hy';
        const dict = this.translations[lang] || this.translations.hy;
        let text = dict[key] !== undefined ? dict[key] : (this.translations.en[key] !== undefined ? this.translations.en[key] : key);

        for (const p in params) {
            text = text.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
        }
        return text;
    }

    getAxisName(axisId, fallbackName) {
        const key = `axis_${axisId}`;
        const translated = this.t(key);
        if (translated && translated !== key) {
            return translated;
        }
        return fallbackName || axisId;
    }

    setLanguage(lang) {
        if (lang !== 'hy' && lang !== 'en') {
            return;
        }
        this.currentLang = lang;
        try {
            localStorage.setItem('app_language', lang);
        } catch (err) {}
        this.notify();
    }

    toggleLanguage() {
        const next = this.currentLang === 'hy' ? 'en' : 'hy';
        this.setLanguage(next);
    }

    onLanguageChange(callback) {
        if (typeof callback === 'function') {
            this.listeners.push(callback);
        }
    }

    notify() {
        document.documentElement.lang = this.currentLang;
        this.listeners.forEach((fn) => {
            try {
                fn(this.currentLang);
            } catch (err) {
                console.error('Error in i18n listener:', err);
            }
        });
    }
}

window.i18n = new I18nManager();
