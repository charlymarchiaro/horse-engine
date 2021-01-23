
export const generateAvatarImageUrl = (firstName: string, lastName: string): string => {

  let nameString = '';

  try {
    const firstNameFirstPart = firstName.split(' ', 1)[0];
    const lastNameFirstPart = lastName.split(' ', 1)[0];

    nameString = (firstNameFirstPart + ' ' + lastNameFirstPart).replace(/ /g, '+');

  } catch (e) {
    nameString = (firstName + ' ' + lastName).replace(/ /g, '+');
  }

  return 'https://ui-avatars.com/api/'
    + '?background=0a84db'
    + '&color=fff'
    + '&rounded=true'
    + '&size=64'
    + '&bold=true'
    + '&length=2'
    + '&font-size=0.4'
    + '&name=' + nameString;
};
