export function processBuckets(data){
    // define optional load params
    data.winterTheme = data.themeNo === 1;
    data.summerTheme = data.themeNo === 2;

    // do not remove this line
    return data;
}