export const formatMoney = (value: number) :string => {
    if (!value) return '';
    
    // Remove any existing formatting
    const cleanedValue = value.toString().replace(/[^0-9.]/g, '');
    
    // Format as currency
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};

export const formatIcon = (iconName: string) :string => {
    console.log(iconName);
    const formattedIconName = iconName.replace(/-/g, '_').toLowerCase();
    console.log(formattedIconName);
    
    return formattedIconName;
};
