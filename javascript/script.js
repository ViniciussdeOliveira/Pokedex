const getTypeColor = type => {
    const normal = '#F5F5F5'
    return {
      normal,
      fire: '#FDDFDF',
      grass: '#DEFDE0',
      electric: '#FCF7DE',
      ice: '#DEF3FD',
      water: '#DEF3FD',
      ground: '#F4E7DA',
      rock: '#D5D5D4',
      fairy: '#FCEAFF',
      poison: '#98D7A5',
      bug: '#F8D5A3',
      ghost: '#CAC0F7',
      dragon: '#97B3E6',
      psychic: '#EAEDA1',
      fighting: '#E6E0D4'
    }[type] || normal
}

const getPokemonsType = async pokeApiResults => {
    const promises = pokeApiResults.map(result => fetch(result.url))
    const responses = await Promise.allSettled(promises)
    const fulfilled = responses.filter(response => response.status === 'fulfilled')
    const pokePromises = fulfilled.map(url => url.value.json())
    const pokemons = await Promise.all(pokePromises)
    return pokemons.map(fulfilled => fulfilled.types.map(info => info.type.name))
}

const getPokemonsImg = async pokeApiResults => {
    const promises = pokeApiResults.map(result => fetch(result.url))
        const responses = await Promise.allSettled(promises)
        const fulfilled = responses.filter(response => response.status === 'fulfilled')
        const pokePromises = fulfilled.map(url => url.value.json())
        const pokemons = await Promise.all(pokePromises)
        const imgPromisse = pokemons.map(data => fetch(data.sprites.front_default))
        const imgResponse = await Promise.all(imgPromisse)
        return imgResponse.map(response => response.url)
}

const getPokemonsIds = pokeApiResults => pokeApiResults.map(({ url }) => {
    const urlAsArray = url.split('/')
    return urlAsArray.at(urlAsArray.length - 2)
})

const pageLoaded = async () => {
    try {
        const resp = await fetch('https://pokeapi.co/api/v2/pokemon?limit=30&offset=0')
        if(!resp.ok){
            throw ERROR ('No information!')
        }

        const { results: pokeApiResults } = await resp.json()
        const types = await getPokemonsType(pokeApiResults)
        const img = await getPokemonsImg(pokeApiResults)        
        const idsPoke = getPokemonsIds(pokeApiResults)

        const pokemons = idsPoke.map((id, i) => ({ id, name: pokeApiResults[i].name, types: types[i], imgUrl: img[i] }))

        console.log(pokemons)


    } catch (error) {
        console.log('OOOOOps: ', error)
    }
}

pageLoaded()