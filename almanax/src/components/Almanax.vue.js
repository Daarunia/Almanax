import { ref, onMounted, computed, watch } from 'vue';
import InputNumber from 'primevue/inputnumber';
import Calendar from 'primevue/calendar';
debugger; /* PartiallyEnd: #3632/script.vue */
const __VLS_export = await (async () => {
    // Valeurs réactives
    const count = ref(1);
    const startDate = ref(new Date);
    const endDate = ref(new Date);
    const items = ref([]);
    onMounted(async () => {
        const response = await fetch('/almanax_2028.json');
        items.value = await response.json();
        items.value = items.value.map((item) => ({
            ...item,
            purchased: false
        }));
        // gestion du cache
        const savedCount = localStorage.getItem('count');
        const savedStart = localStorage.getItem('startDate');
        const savedEnd = localStorage.getItem('endDate');
        const savedPurchased = localStorage.getItem('purchased');
        if (savedCount)
            count.value = Number(savedCount);
        if (savedStart)
            startDate.value = new Date(savedStart);
        if (savedEnd)
            endDate.value = new Date(savedEnd);
        // Restaurer les cases cochées si elles ont été sauvegardées
        if (savedPurchased) {
            const purchasedState = JSON.parse(savedPurchased);
            items.value.forEach((item) => {
                if (purchasedState[item.object]) {
                    item.purchased = true;
                }
            });
        }
    });
    const getDayMonth = (date) => {
        const d = new Date(date);
        return { day: d.getDate(), month: d.getMonth() + 1 };
    };
    const onCheckboxChange = (item) => {
        console.log('✅ Checkbox changée pour :', item);
    };
    const filteredItems = computed(() => {
        if (!startDate.value || !endDate.value)
            return [];
        const start = getDayMonth(startDate.value);
        const end = getDayMonth(endDate.value);
        // Si la plage de dates "passe par la fin d'année" (ex: du 20/12 au 10/01)
        const crossesYear = (end.month < start.month) || (end.month === start.month && end.day < start.day);
        return items.value.filter((item) => {
            const { day, month } = getDayMonth(item.date);
            if (crossesYear) {
                // ex: du 20/12 au 10/01
                return ((month > start.month || (month === start.month && day >= start.day)) ||
                    (month < end.month || (month === end.month && day <= end.day)));
            }
            else {
                // plage normale dans la même année
                if (month < start.month || month > end.month)
                    return false;
                if (month === start.month && day < start.day)
                    return false;
                if (month === end.month && day > end.day)
                    return false;
                return true;
            }
        });
    });
    watch(count, (newVal) => {
        if (newVal !== null)
            localStorage.setItem('count', newVal.toString());
    });
    watch(startDate, (newVal) => {
        if (newVal)
            localStorage.setItem('startDate', newVal.toISOString());
    });
    watch(endDate, (newVal) => {
        if (newVal)
            localStorage.setItem('endDate', newVal.toISOString());
    });
    watch(items, (newVal) => {
        const purchasedState = {};
        newVal.forEach(item => {
            if (item.purchased)
                purchasedState[item.object] = true;
        });
        localStorage.setItem('purchased', JSON.stringify(purchasedState));
    }, { deep: true });
    debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
    const __VLS_self = (await import('vue')).defineComponent({
        components: {
            InputNumber,
            Calendar
        }
    });
    const __VLS_ctx = {
        ...{},
        ...{},
    };
    const __VLS_componentsOption = {
        InputNumber,
        Calendar
    };
    let __VLS_components;
    let __VLS_directives;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-row h-full" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col justify-center items-center gap-5 align-center w-1/2 p-6 rounded" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col w-100" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        for: "count",
        ...{ class: "w-full mb-1 font-medium text-gray-700" },
    });
    const __VLS_0 = {}.InputNumber;
    /** @type {[typeof __VLS_components.InputNumber, ]} */ ;
    // @ts-ignore
    InputNumber;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        id: "count",
        modelValue: (__VLS_ctx.count),
        min: (0),
        max: (100),
        showButtons: true,
        ...{ class: "w-full" },
    }));
    const __VLS_2 = __VLS_1({
        id: "count",
        modelValue: (__VLS_ctx.count),
        min: (0),
        max: (100),
        showButtons: true,
        ...{ class: "w-full" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    // @ts-ignore
    [count,];
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col  w-100" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        for: "start",
        ...{ class: "w-full mb-1 font-medium text-gray-700" },
    });
    const __VLS_5 = {}.Calendar;
    /** @type {[typeof __VLS_components.Calendar, ]} */ ;
    // @ts-ignore
    Calendar;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
        id: "start",
        modelValue: (__VLS_ctx.startDate),
        showIcon: (true),
        dateFormat: "dd/mm/yy",
        ...{ class: "w-full" },
        inputClass: "w-full",
    }));
    const __VLS_7 = __VLS_6({
        id: "start",
        modelValue: (__VLS_ctx.startDate),
        showIcon: (true),
        dateFormat: "dd/mm/yy",
        ...{ class: "w-full" },
        inputClass: "w-full",
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    // @ts-ignore
    [startDate,];
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col  w-100" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        for: "end",
        ...{ class: "w-full mb-1 font-medium text-gray-700" },
    });
    const __VLS_10 = {}.Calendar;
    /** @type {[typeof __VLS_components.Calendar, ]} */ ;
    // @ts-ignore
    Calendar;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({
        id: "end",
        modelValue: (__VLS_ctx.endDate),
        showIcon: (true),
        dateFormat: "dd/mm/yy",
        ...{ class: "w-full" },
        inputClass: "w-full",
    }));
    const __VLS_12 = __VLS_11({
        id: "end",
        modelValue: (__VLS_ctx.endDate),
        showIcon: (true),
        dateFormat: "dd/mm/yy",
        ...{ class: "w-full" },
        inputClass: "w-full",
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    // @ts-ignore
    [endDate,];
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "w-1/2 overflow-y-auto max-h-full mt-5 mb-5" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "text-lg font-semibold mb-3 text-gray-700" },
    });
    (__VLS_ctx.filteredItems.length);
    // @ts-ignore
    [filteredItems,];
    __VLS_asFunctionalElement(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
        ...{ class: "space-y-2 max-h-full w-1/2" },
    });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.filteredItems))) {
        // @ts-ignore
        [filteredItems,];
        __VLS_asFunctionalElement(__VLS_intrinsics.li, __VLS_intrinsics.li)({
            key: (item.object + index),
            ...{ class: "flex items-center p-3 bg-surface-50 dark:bg-surface-900 rounded-lg border border-gray-200 dark:border-gray-700" },
        });
        const __VLS_15 = {}.Checkbox;
        /** @type {[typeof __VLS_components.Checkbox, typeof __VLS_components.Checkbox, ]} */ ;
        // @ts-ignore
        Checkbox;
        // @ts-ignore
        const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
            ...{ 'onChange': {} },
            binary: true,
            ...{ class: "mr-4" },
            modelValue: (item.purchased),
        }));
        const __VLS_17 = __VLS_16({
            ...{ 'onChange': {} },
            binary: true,
            ...{ class: "mr-4" },
            modelValue: (item.purchased),
        }, ...__VLS_functionalComponentArgsRest(__VLS_16));
        let __VLS_19;
        let __VLS_20;
        const __VLS_21 = ({ change: {} },
            { onChange: (...[$event]) => {
                    __VLS_ctx.onCheckboxChange(item);
                    // @ts-ignore
                    [onCheckboxChange,];
                } });
        var __VLS_18;
        __VLS_asFunctionalElement(__VLS_intrinsics.a, __VLS_intrinsics.a)({
            href: (item.url),
            target: "_blank",
            ...{ class: "font-medium text-blue-600 dark:text-blue-400 hover:underline" },
        });
        (item.object);
        __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "ml-2 text-gray-500 dark:text-gray-400 mr-5" },
        });
        (item.quantity * __VLS_ctx.count);
        // @ts-ignore
        [count,];
        __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "block text-sm text-gray-400" },
        });
        (new Date(item.date).toLocaleDateString('fr-FR'));
    }
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['align-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-surface-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:bg-surface-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:border-gray-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['mr-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-blue-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:text-blue-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:underline']} */ ;
    /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['mr-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    return (await import('vue')).defineComponent({
        components: {
            InputNumber,
            Calendar
        }
    });
})();
export default {};
//# sourceMappingURL=Almanax.vue.js.map