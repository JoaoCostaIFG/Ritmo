export function timeStr2Secs(timeStr: string): number {
    const timeComponents = timeStr.split(":");
    if (timeComponents.length > 3 || timeComponents.length === 0) {
        throw new Error("Time string is invalid. Try something like 120, 2:0, or 0:2:0");
    }

    let secs = 0;
    for (let i = 0; i < timeComponents.length; ++i) {
        secs *= 60;
        secs += parseInt(timeComponents[i]);
    }
    return secs;
}

export function secs2TimeStr(secs: number): string {
    let timeStr = "";
    const hours = Math.trunc(secs / 3600);
    const mins = Math.trunc((secs % 3600) / 60);
    const secsRem = secs % 60;

    if (hours > 0) {
        timeStr += `${hours}:`;
    }
    timeStr += `${mins.toString().padStart(2, '0')}:${secsRem.toString().padStart(2, '0')}`;

    return timeStr;
}