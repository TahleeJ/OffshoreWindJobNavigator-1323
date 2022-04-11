// List of query functions recognized by BigQuery
export const queryFunctions = [
    "get_all_title_day",
    "get_all_day",
    "get_all_titles",
    "get_each_title_day",
    "get_each_day",
    "get_each_titles",
    "get_navigator_title_day",
    "get_navigator_day",
    "get_navigator_titles"
];

// List of query functions in a more operational format
export enum DataQuery {
    AllTitlesPerDay = 0,
    AllPerDay = 1,
    AllTitles = 2,
    EachTitlesPerDay = 3,
    EachPerDay = 4,
    EachTitles = 5,
    OneTitlesPerDay = 6,
    OnePerDay = 7,
    OneTitles = 8,
    None = 9
}

export enum NavigatorGrouping {
    All = 0,
    Set = 1,
    One = 2
}

export enum DateGrouping {
    Week = 0,
    Day = 1
}

export enum Chart {
    Pie = 0,
    Combo = 1,
    Line = 2,
    Bar = 3
}

export interface SerializedEntry {
    title?: string
    frequency: number
}

export const dataFocusTypes = {
    titleday: "TitleDay",
    perday: "PerDay",
    titles: "Titles"
};

// List of data focuses (sets) able to be represented by each chart type
export const validQueryCharts = {
    pie: {
        list: [DataQuery.AllTitles, DataQuery.OneTitles, DataQuery.AllTitlesPerDay, DataQuery.OneTitlesPerDay], // EachTitles
        text: "Total administration of all surveys\nAdministration total of each selected survey over the past week"
    }, 
    combo: {
        list: [DataQuery.AllTitlesPerDay, DataQuery.OneTitlesPerDay],
        text: "Administration total of each selected survey over the past week"
    },
    line: {
        list: [DataQuery.AllTitlesPerDay, DataQuery.OneTitlesPerDay, DataQuery.AllPerDay, DataQuery.OnePerDay],
        text: "Administration total of each selected survey over the past week\nAdministration total of all surveys over the past week"
    },
    bar: {
        list: [DataQuery.AllTitlesPerDay, DataQuery.OneTitlesPerDay, DataQuery.AllTitles, DataQuery.OneTitles, DataQuery.AllPerDay, DataQuery.OnePerDay], // EachTitles, EachPerDay
        text: 'Administration total of each selected survey over the past week\nAdministration total of all surveys over the past week\nTotal administration of all surveys'
    }
}

/**
 * Turns the BigQuery provided dates into a more readable format
 * 
 * @param date the event date sent back from BigQuery
 * @returns the human-friendly date format
 */
export function stringifyDate(date: string): string {
    const month = date.substring(4, 6);
    const day = date.substring(6);
    const year = date.substring(0, 4);

    const newDate = `${month}/${day}/${year}`;

    return newDate;
}

/**
 * Determines the type of query that will be sent to BigQuery
 * 
 * @param dataFocusEntry the desired data focus (set)
 * @param navigatorGroupingEntry the desired navigator(s) to see data for
 * @returns the type of data query to be sent out
 */
export function determineQueryType(dataFocusEntry: string, navigatorGroupingEntry: NavigatorGrouping): DataQuery {
    var chartQueryType: DataQuery;

    switch(navigatorGroupingEntry) {
        case NavigatorGrouping.All:
            switch(dataFocusEntry) {
                case dataFocusTypes.titleday:
                    chartQueryType = DataQuery.AllTitlesPerDay;
                    break;
                case dataFocusTypes.perday:
                    chartQueryType = DataQuery.AllPerDay;
                    break;
                case dataFocusTypes.titles:
                    chartQueryType = DataQuery.AllTitles;
                    break;
                default:
                    break;
            }
            break;
        case NavigatorGrouping.Set:
            switch(dataFocusEntry) {
                case dataFocusTypes.titleday:
                    chartQueryType = DataQuery.None;
                    break;
                case dataFocusTypes.perday:
                    chartQueryType = DataQuery.EachPerDay;
                    break;
                case dataFocusTypes.titles:
                    chartQueryType = DataQuery.EachTitles;
                    break;
                default:
                    break;
            }
            break;
        case NavigatorGrouping.One:
            switch(dataFocusEntry) {
                case dataFocusTypes.titleday:
                    chartQueryType = DataQuery.OneTitlesPerDay;
                    break;
                case dataFocusTypes.perday:
                    chartQueryType = DataQuery.OnePerDay;
                    break;
                case dataFocusTypes.titles:
                    chartQueryType = DataQuery.OneTitles;
                    break;
                default:
                    break;
            }
            break;
        default:
            break;
    }

    return chartQueryType!;
}

/**
 * Validates that the selected chart type is able to represent the selected
 * data focus (set)
 * 
 * @param chartType the desired chart type
 * @param queryType the desired data focus
 * @returns whether the desired chart is able to represent the desired data focus
 */
export function validateChartType(chartType: Chart, queryType: DataQuery): boolean {
    var validChartType: boolean;

    switch(chartType!) {
        case Chart.Pie:
            validChartType = validQueryCharts.pie.list.includes(queryType);
            break;
        case Chart.Combo:
            validChartType = validQueryCharts.combo.list.includes(queryType);
            break;
        case Chart.Line:
            validChartType = validQueryCharts.line.list.includes(queryType);
            break;
        case Chart.Bar:
            validChartType = validQueryCharts.bar.list.includes(queryType);
            break;
        default:
            break;
    }

    return validChartType!;
}