const axios = require("axios");
const cheerio = require("cheerio");

class SearchFilm {
  /**
   * @constructor
   */
  constructor() {
    this.data = [];
  }

  /**
   * IMDB sitesine istek atar.
   *
   * @param data
   * @param search {String}
   * @returns {Promise<any>}
   */
  async getRequest(search) {
    // Kelimeyi query uygun çevirme.
    search = new URLSearchParams(search).toString();
    // İmdb sitesine istek atma.
    const { data } = await axios.get(`https://www.imdb.com/find?q=${search}&s=tt&ref_=fn_al_tt_mr`);
    // html şeklinde sonuçları dönme.
    return data;
  }

  /**
   * IMDB sitesine aramak istediğiniz kelimeyi gönderir.
   *
   * @param search {String}
   * @returns {Array}
   */
  async search(search) {
    // Split etmek için cheerio kullanıyoruz.
    const $ = cheerio.load(await this.getRequest(search));

    // verilerimiz bu standartta olacak.
    var dataObject = {
      image: null,
      title: null,
      year: null,
      season: null,
      episode: null
    };
    
    // Dönen liste bir tablo içinde döngüye alıyoruz.
    $(".findList > tbody > tr > td").each((index, element) => {
      var text = $(element).text();

      // Split işlemleri
      var titleSpit = text.split("(");
      var yearSpit = text.match(/\(\d*?\)/g);
      var seasonAndEpisodeSpit = text.match( '-(.*)-' ); 
  
      if(titleSpit && titleSpit.length > 0 && titleSpit[0].trim()) {
        // Başlıktaki başında ve sonunda boşluklar varsa sil.
        dataObject.title = titleSpit[0].replace(/^[ ]+|[ ]+$/g,"");
      }
      if(yearSpit && yearSpit.length > 0) {
        // Yıldaki () silip int çevir.
        dataObject.year = parseInt(yearSpit[0].replace(/[()]/g,""));
      }

      // Sezon ve bölüm sayılarını alma.
      if(seasonAndEpisodeSpit && seasonAndEpisodeSpit.length > 0 && seasonAndEpisodeSpit[1].includes("Season")) {
        var test = seasonAndEpisodeSpit[1].split("|");
        dataObject.season = parseInt(test[0].match(/\d+/g)[0]);
        dataObject.episode = parseInt(test[1].match(/\d+/g)[0]);
      }
  
      // Image alma.
      if($(element).find("img")[0] && $(element).find("img")[0].attribs) {
        var imageUrl = $(element).find("img")[0].attribs.src;
        dataObject.image = imageUrl;
      }

      // Bug olmaması için resim ve title zorunlu alanlar dolu ise pushla. Aksi halde title boş sadece resim pushlanabiliyor.
      if(dataObject.image && dataObject.title) {
        this.data.push(dataObject);
      }
      
      // Her 2 döngüde bir verileri sıfırlama
      if(index === 1 || index % 2 !== 0) {
        dataObject = {
          image: null,
          title: null,
          year: null,
          season: null,
          episode: null
        };
      }
    });

    return this.data;
  }
}

module.exports = SearchFilm;