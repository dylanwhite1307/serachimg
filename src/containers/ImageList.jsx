import React, { Component } from "react";

class ImageList extends Component{
  constructor() {
    super()
  }
  state = {
  }

  tagName = () =>{
    return document.querySelector('.app-form-input_tag')
  }

  stopDefault = (e) =>{
    e.preventDefault()
  }
  uploadImage = (e) =>{
    if(this.tagName().value.replace(/\s+/g, '') === ''){
      alert(`Заполните поле "Тег"!`)
      return
    }
    const tagNames = () => {
      const tagName = this.tagName().value
      return tagName.split(',')
    }


    this.getImg(e, tagNames())
  }

  createImg = (val) => {
    let imgList = document.querySelector('.app-image-list')  
    let div = document.createElement('div')
    for(let i = 0; i < val.length; i++){
      let img = document.createElement('img')
      img.src = val[i]
      img.alt = this.tagName().value
      img.addEventListener('click', () => {
        this.tagName().value = img.alt
      })
      div.appendChild(img)
    }
    div.className = `imgLoaded imgLoaded${imgList.childNodes.length+1} ${this.tagName().value}`
    imgList.insertAdjacentElement('afterbegin', div)
  }
  

  getImg = (e,tagNm) =>{
    let urlForImg = []
    const toggleBtn = () => {
      if(e.target.disabled){
        e.target.removeAttribute('disabled')
        e.target.innerHTML = 'Загрузить'
        return 
      } 
      e.target.disabled = true
      e.target.innerHTML = 'Загрузка...' 
    }
    const apiFooAsync = async() => {
      urlForImg = []
      if(tagNm[0] === 'delay'){
        function timer(ms) {
          return new Promise(res => setTimeout(res, ms));
         }
        e.target.classList.toggle('fetch_active')
        e.target.innerHTML = 'Прервать'
        let controller = new AbortController()
        const load = async() => {
            for(let i = 1; i > 0; i++){
              if(e.target.classList.contains('fetch_active')){
                urlForImg = []
                try{
                  const response = await fetch(`https://api.giphy.com/v1/gifs/random?api_key=7Natr1TgEDKqb01Iw01NdOWWars3JgqD`, {
                    method: 'GET',
                    signal: controller.signal
                  })           
                  const content = await response.json()
                  if(!content.data.images){
                    throw new Error('По тегу ничего не найдено')
                  } 
                  urlForImg.push(content.data.images.downsized.url)
                  this.createImg(urlForImg)
                } catch (error){
                  alert(error)
                }
                await timer(5000)   
            } else {
              controller.abort()
              toggleBtn()
              return
            }
          }
          
      }   
        load();
      } else{
          for(let i = 0; i < tagNm.length; i++){
            if(tagNm[i] !== ''){
              toggleBtn()
              try{
                const response = await fetch(`https://api.giphy.com/v1/gifs/random?api_key=7Natr1TgEDKqb01Iw01NdOWWars3JgqD&tag=${tagNm[i]}`, {
                  method: 'GET'
                })           
                const content = await response.json()
                if(!content.data.images){
                  throw new Error('По тегу ничего не найдено')
                } 
                urlForImg.push(content.data.images.downsized.url)
                
              } catch (error){
                alert(error)
              }      
              toggleBtn()
            }
          }      
          this.createImg(urlForImg)
      }
        
    }
    
    apiFooAsync()
  }

  cleanImg = () => {
    const appImgList = document.querySelector('.app-image-list')
    while(appImgList.firstChild){
      appImgList.firstChild.remove()
    }
  }

  groupImg = () => {
    const arrayImgs = []
    const appImgList = document.querySelector('.app-image-list')
    for(let i = 0; i < appImgList.children.length; i++){
        arrayImgs.push(appImgList.children[i]) 
    }
   
    const groupImgReduce = (array) => {
      return array.reduce((acc, obj) => {
        const prop = obj.classList[obj.classList.length-1]
        acc[prop] = acc[prop] || []
        acc[prop].push(obj)
        return acc
      }, {})
      
    }

    const objectImgs = groupImgReduce(arrayImgs)

    Object.entries(objectImgs).forEach((arrImg) => {
      const section = document.createElement('section')
      const h3 = document.createElement('h3')
      const div = document.createElement('div')
      section.className = `app-image-list-sec_${arrImg[0]}`
      h3.innerText = arrImg[0]
      section.appendChild(h3)
      arrImg[1].forEach((val)=>{
        div.appendChild(val)
      })
      section.appendChild(div)
      appImgList.insertAdjacentElement('afterbegin', section)
    })
  }

  ungroupImg = () => {
    const imgs = document.querySelectorAll('.imgLoaded')
    const div = document.querySelector('.app-image-list')
    for(let i = 0; i < imgs.length; i++){
      div.insertAdjacentElement('afterbegin', document.querySelector(`.imgLoaded${i+1}`))
    }
    const deleteSection = () => {
      for(let i = div.children.length-1; i >= 0; i--){
        if(div.children[i].localName === 'section'){
          div.children[i].remove()
        }
      }
    }
    deleteSection()
  }

  render(){
    return(
      <div className="container">
        <form action="" className="app-form">
          <input type="text" className="app-form-input_tag" onKeyPress={(e) => {
            if(!/[a-z\,]/i.test(e.key)){
              e.target.disabled = true
              alert('Для ввода доступны только латинские буквы и запятая')
              e.target.removeAttribute('disabled')
            }
          }}/>
          <button className="app-form-btn_upload" onClick={(e) => {
            this.stopDefault(e)
            this.uploadImage(e)
          }}>Загрузить</button>
          <button className="app-form-btn_clean" type="reset" onClick={(e) => {
           this.cleanImg()
          }}>Очистить</button>
          <button className="app-form-btn_group"onClick={(e) => {
            this.stopDefault(e)
            this.groupImg()
            e.target.classList.add('none')
            document.querySelector('.app-form-btn_ungroup').classList.remove('none')
            document.querySelector('.app-form-btn_clean').disabled = true
            document.querySelector('.app-form-btn_upload').disabled = true
            document.querySelector('.app-image-list').classList.add('section_active')
          }}>Группировать</button>
          <button className="app-form-btn_ungroup none"onClick={(e) => {
            this.stopDefault(e)
            this.ungroupImg()
            e.target.classList.add('none')
            document.querySelector('.app-form-btn_group').classList.remove('none')
            document.querySelector('.app-form-btn_upload').removeAttribute('disabled')
            document.querySelector('.app-form-btn_clean').removeAttribute('disabled')
            document.querySelector('.app-image-list').classList.remove('section_active')
          }}>Разгруппировать</button>
        </form>
        <div className="app-image-list">
 
        </div>
      </div>
      

    )
  }
  
}

export default ImageList