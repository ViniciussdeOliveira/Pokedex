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

const pagination = (() => {
    const limit = 30
    let offset = 0

    const getLimit = () => limit
    const getOffset = () => offset
    const incrementOffset = () => offset += limit


    return {getLimit, getOffset, incrementOffset}
})()

const getPokemons = async () => {
    try {
        const { getLimit, getOffset, incrementOffset } = pagination
        const resp = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${getLimit()}&offset=${getOffset()}`)
        if(!resp.ok){
            throw new ERROR ('No information!')
        }

        const { results: pokeApiResults } = await resp.json()
        const types = await getPokemonsType(pokeApiResults)
        const img = await getPokemonsImg(pokeApiResults)        
        const idsPoke = getPokemonsIds(pokeApiResults)

        const pokemons = idsPoke.map((id, i) => ({ id, name: pokeApiResults[i].name, types: types[i], imgUrl: img[i] }))

        incrementOffset()

        return pokemons
    } catch (error) {
        console.log('OOOOOps: ', error)
    }
}

const renderPokemons = pokemons => {
    const ul = document.querySelector('[data-js="pokemons-list"]')
    const fragment = document.createDocumentFragment()
    
    pokemons.forEach(({ id, name, types, imgUrl }) => {
        const li = document.createElement('li')
        const img = document.createElement('img')
        const idNumber = document.createElement('h3')
        const nameContainer = document.createElement('h2')
        const typeContainer = document.createElement('p')
        const [firstType] = types

        img.setAttribute('src', imgUrl)
        img.setAttribute('alt', name)
        img.setAttribute('class', 'card-image')
        li.setAttribute('class', `card ${firstType}`)
        li.style.setProperty('--type-color', getTypeColor(firstType))

        idNumber.textContent = `#${id}`
        nameContainer.textContent = `${name[0].toUpperCase()}${name.slice(1)}`
        typeContainer.textContent = types.length > 1 ? types.join(' | '): firstType
        li.append(img, idNumber, nameContainer, typeContainer)

        fragment.append(li)
    });
    ul.append(fragment)
}

const observeLastPokemon = pokemonObserver => {
    const lastPokemon = document.querySelector('[data-js="pokemons-list"]').lastChild
    pokemonObserver.observe(lastPokemon)
}

const handleNextPokemon = () => {
    const pokemonObserver = new IntersectionObserver(async ([lastPokemon], observer) => {
        if (!lastPokemon.isIntersecting){
            return
        }
        observer.unobserve(lastPokemon.target)

        if (pagination.getOffset >= 1302){
            return
        }

        const pokemons = await getPokemons()
        renderPokemons(pokemons)
        observeLastPokemon(pokemonObserver)
    }, { rootMargin: '500px' })
    observeLastPokemon(pokemonObserver)
}

const pageLoaded = async () => {
    const pokemons = await getPokemons()
    renderPokemons(pokemons)
    handleNextPokemon()
}

pageLoaded()