
import dataBySpecies from "../data/organized-by-species.json";


const URLSEARHCKEY = "selected";
const URLSEARHSEPARATOR = "-";

const convertToURLName = (name) => name.toLowerCase().replace(/ /g, "");

const joinedSpeciesNameMap = Object.entries(dataBySpecies).reduce(
    (acc, [key, value]) => ({ ...acc, [convertToURLName(key)]: value }),
    {}
);

const convertFromURLName = (name) => {
    // sAnpEdro1
    // Now turn those into valid titles
    let plantNumber = name.match(/[0-9]+/);
    let listOfValidPlants = joinedSpeciesNameMap[convertToURLName(name).replace(/[0-9]/g, "")];
    return listOfValidPlants.find((plant) => plant.includes(plantNumber));
};

const getPlantTitlesFromUrlSafeNames = (arr) => {
    // filter url names to ensure they're even valid plants
    return Array.from(new Set(arr
        .filter((name) => name.replace(/[ 0-9]/g, "") in joinedSpeciesNameMap)
        .map(convertFromURLName)));
};

export function getPlantsFromURL() {
    const preselected = new URLSearchParams(window.location.search);
    return preselected && preselected.get(URLSEARHCKEY)
        ? getPlantTitlesFromUrlSafeNames(
            preselected.get(URLSEARHCKEY).split(URLSEARHSEPARATOR)
        )
        : [];
}

export function setUrlBarBasedOnName(newPlants) {
    if (window.history.pushState) {
        const newURL = new URL(window.location.href);
        newURL.search = newPlants.length ? `?${new URLSearchParams({
            [URLSEARHCKEY]: newPlants.map(convertToURLName).join(URLSEARHSEPARATOR),
        })}` : '';
        window.history.pushState({ path: newURL.href }, "", newURL.href);
    }
}

