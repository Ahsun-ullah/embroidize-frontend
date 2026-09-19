// The five Q4 categories behind the "Designs for Every Q4 Moment" cards and
// the gallery slider below them. Both read this list, so a card's
// "See These Designs" link and the slide it opens can never drift apart.
//
// Each category shows up to 12 images (one slide). Sources are 2400×1600
// design images on the CDN host — never the Spaces origin, which is what made
// this page slow before.
const CDN = 'https://embroidize-assets.nyc3.cdn.digitaloceanspaces.com';

export const GALLERY_CATEGORIES = [
  {
    id: 'halloween',
    label: 'Halloween',
    images: [
      { src: `${CDN}/1757575532567.jpg`, alt: 'Cute Mummy, Pumpkin & Ghost' },
      { src: `${CDN}/1752687637220.jpg`, alt: 'Boo Cute Girl Ghost with Bats' },
      { src: `${CDN}/1759991742073.png`, alt: 'Trick or Treat Bats & Webs' },
      { src: `${CDN}/1768037806507.png`, alt: 'Dancing Cowboy Skeletons' },
      { src: `${CDN}/1769086167216.png`, alt: 'Halloween Cat & Gnome' },
      { src: `${CDN}/1759922747319.png`, alt: 'Happy Halloween Bats & Webs' },
      { src: `${CDN}/1758515186694.png`, alt: 'Bats & Crescent Moon' },
      { src: `${CDN}/1752685027092.jpg`, alt: 'Cute Ghost with Coffee' },
      { src: `${CDN}/1769083499084.png`, alt: 'Magic Wizard Hat & Spell Book' },
      { src: `${CDN}/1768906625523.png`, alt: 'Spider Wreath & Witch Hat' },
      { src: `${CDN}/1768201977912.png`, alt: 'Halloween Gnome Truck' },
      {
        src: `${CDN}/1761729338204.png`,
        alt: 'Halloween Ghost Bouquet with Pumpkin & Flowers',
      },
    ],
  },
  {
    id: 'fall-thanksgiving',
    label: 'Fall & Thanksgiving',
    images: [
      { src: `${CDN}/1761195496051.png`, alt: 'Thankful Pumpkin' },
      { src: `${CDN}/1758444530346.png`, alt: 'Purple Truck & Pumpkins' },
      { src: `${CDN}/1760241448221.png`, alt: 'Whimsical Lantern Gnome' },
      { src: `${CDN}/1752253420577.jpg`, alt: 'My First Thanksgiving' },
      { src: `${CDN}/1769246011959.png`, alt: 'Happy Thanksgiving' },
      { src: `${CDN}/1774950601893.png`, alt: 'Autumn Harvest Turkey' },
      {
        src: `${CDN}/1758701475797.png`,
        alt: 'Happy Fall Y’all Autumn Leaves',
      },
      { src: `${CDN}/1760606006185.png`, alt: 'Leopard Pumpkin Rainbow' },
      { src: `${CDN}/1769247563463.png`, alt: 'Fall Gnome with Pumpkin' },
      { src: `${CDN}/1769247279714.png`, alt: 'Pumpkins & Sunflowers Sketch' },
      { src: `${CDN}/1758700278168.png`, alt: 'Autumn Gnome with Pumpkins' },
      { src: `${CDN}/1766487972940.png`, alt: 'Hello Pumpkin Patch' },
    ],
  },
  {
    id: 'christmas',
    label: 'Christmas',
    images: [
      { src: `${CDN}/1760610511612.png`, alt: 'Merry Christmas Monster Truck' },
      { src: `${CDN}/1760606760038.png`, alt: 'Snowflakes Kisses from Heaven' },
      { src: `${CDN}/1760180424227.png`, alt: 'Merry Christmas Embroidery' },
      { src: `${CDN}/1758759945868.png`, alt: 'Oh, Christmas Tree & Bow' },
      { src: `${CDN}/1760416748548.png`, alt: 'Cute Winter Snowman' },
      { src: `${CDN}/1760605000525.png`, alt: 'Merry Christmas Ornament' },
      { src: `${CDN}/1758445643263.png`, alt: 'Gingerbread Gnome & House' },
      { src: `${CDN}/1756962835332.jpg`, alt: 'Berry Twig Christmas Wreath' },
      { src: `${CDN}/1766394549148.png`, alt: 'Christmas Baking Crew' },
      { src: `${CDN}/1760436280360.png`, alt: 'Let It Snow Snowflakes' },
      {
        src: `${CDN}/1760436669225.png`,
        alt: 'Just a Girl Who Loves Christmas',
      },
      {
        src: `${CDN}/1754024123259.jpg`,
        alt: 'Christmas Ghost with Candy Cane, Coffee & Gingerbread',
      },
    ],
  },
  {
    id: 'holiday-gifts',
    label: 'Holiday Gifts',
    images: [
      { src: `${CDN}/1764052271903.png`, alt: 'Christmas Gnome Gift' },
      { src: `${CDN}/1760606606375.png`, alt: 'Christmas Gnome & Gift' },
      { src: `${CDN}/1760434108044.png`, alt: 'Festive Christmas Gnome Gift' },
      { src: `${CDN}/1770785768162.png`, alt: 'Blue Christmas Gnome Trio' },
      { src: `${CDN}/1760422047624.png`, alt: 'Gift Box with Swirls & Stars' },
      {
        src: `${CDN}/1752690754508.jpg`,
        alt: 'Christmas Apple with Santa Hat & Gift Box',
      },
      {
        src: `${CDN}/1789276904086_f288155f12d8.png`,
        alt: 'Floral Gift Box with Bow',
      },
      { src: `${CDN}/1764065244105.png`, alt: 'Christmas Cats Trio' },
      { src: `${CDN}/1763551786731.png`, alt: 'Cute Christmas Gnomes Gift' },
      { src: `${CDN}/1771224832174.png`, alt: 'Christmas Snowman with Gift' },
      { src: `${CDN}/1762240704658.png`, alt: 'Heart Balloon Gift Box' },
      { src: `${CDN}/1756210014649.jpg`, alt: 'Book Christmas Tree' },
    ],
  },
  {
    id: 'new-year',
    label: 'New Year',
    images: [
      { src: `${CDN}/1763550009637.png`, alt: 'Happy New Year Gnome' },
      { src: `${CDN}/1771826534844.png`, alt: 'Baby’s My 1st New Year' },
      { src: `${CDN}/1771390316921.png`, alt: 'New Year Gnome Clock' },
      { src: `${CDN}/1771307787765.png`, alt: 'Happy New Year Champagne' },
      { src: `${CDN}/1766835918676.png`, alt: 'Happy New Year Script' },
      {
        src: `${CDN}/1766815632980.png`,
        alt: 'New Year Wishes Midnight Kisses',
      },
      { src: `${CDN}/1771829351950.png`, alt: 'My 1st New Year Baby Bottle' },
      {
        src: `${CDN}/1763814519247.png`,
        alt: 'Merry Christmas & Happy New Year Ornament',
      },
      { src: `${CDN}/1771732633863.png`, alt: 'New York Skyline Fireworks' },
      { src: `${CDN}/1770807715661.png`, alt: 'Triple Fireworks Burst' },
      { src: `${CDN}/1758356850132.png`, alt: 'Bursting Stars Firework' },
      { src: `${CDN}/1770790384234.png`, alt: 'Confetti Stars & Swirls' },
    ],
  },
];

export const galleryHref = (id) => `#gallery-${id}`;
