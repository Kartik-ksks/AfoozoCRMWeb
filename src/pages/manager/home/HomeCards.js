import mainPageData from '../../PageData';

const homeCards = mainPageData.filter((data) => data.name !== 'Home');
export default homeCards;