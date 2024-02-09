import Verse from './Verse';

type ProjectionConfiguration = {
    verseCount : number | 1,
    fontSize: number,
    translations: string[],
    bgColor: string,
    textColor: string,
    verseTextWeight: number,
    verseNumberWeight: number,
    verseInfoWeight: number,
}


export type DisplayVerseEvent = {
    payload: {
        eng: Verse[],
        ro: Verse[]
    }
}

export type ProjectionFormatEvent = {
    payload: ProjectionConfiguration
}

export default ProjectionConfiguration;
