import { StyleSheet } from "react-native";
import { hexToRgba } from "../lib/utils";


export const styles_toremove = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'left',
    paddingTop: 20,
    padding: 20
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 10,
    backgroundColor: "white",
    borderRadius: 30,
    padding: 35,
    alignItems: "left",
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 5
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Quicksand-Bold'
  },
  closeButton: {
    color: '#053547',
    fontFamily: 'Quicksand-Bold'
  },
  modalContent: {
    width: '100%'
  },
  filterSection: {
    marginBottom: 20,
    width: '100%'
  },
  filterLabel: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    marginBottom: 8
  },
  dateInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  dateButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    width: '48%'
  },
  dateButtonText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium'
  },
  picker: {
    width: '100%',
    height: 50,
    borderRadius: 100,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Montserrat-Medium',
    borderColor: '#05354730',
    borderWidth: 1
  },
  modalFooter: {
    marginTop: 20,
    width: '100%'
  },
  buttonClose: {
    backgroundColor: '#053547'
  },
  textStyle: {
    color: "white",
    fontFamily: 'Quicksand-Bold'
  },
  logo: {
    width: 72,
    height: 72,
    resizeMode: 'contain'
  },
  logoText: {
    fontSize: 32, 
    color: '#e1523d', 
    fontFamily: 'Quicksand-Bold', 
    marginBottom: 20
  },
  title: {
    fontSize: 24, 
    fontFamily: 'Quicksand-Bold', 
    marginTop: 20
  },
  label: {
    fontSize: 12, 
    fontFamily: 'Montserrat-Medium',
    marginBottom: 10
  },
  input: {
    borderWidth: 1,
    borderColor: '#05354730',
    borderRadius: 25,
    padding: 10,
    marginBottom: 10,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 14,
    color: '#444444',
    fontFamily: 'Montserrat-Medium',
  },
  button: {
    backgroundColor: '#053547',
    padding: 10,
    borderRadius: 25,
    marginTop: 10,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff', 
    fontFamily: 'Montserrat-SemiBold'
  },
  dateInput: {
    borderColor: '#05354730',
    borderWidth: 1,
    borderRadius: 100,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Montserrat-Medium'
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },

  formSection: {
    width: '100%'
  },
  p:{
    fontFamily:'Montserrat-Regular',
    fontSize: 12,
  }
});

export function makeStyles(theme){
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: 20,
    padding: 20
  },
  fullContainer:{
    flex:1,
    backgroundColor:theme.background
  },
  dashboard: {
    flex: 1,
    marginTop: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  toolCard: {
    backgroundColor: theme.surface,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 1
  },
  toolCardContent: {
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  toolIcon: {
    width:64, 
    height:64, 
    position:'absolute', 
    top:5, 
    right:5, 
    opacity:0.5 },
  toolType: {
    fontSize: 10,
    fontFamily: 'Montserrat-Regular',
    color: theme.subtext,
    marginBottom: 5
  },
  toolTitle: {
    fontSize: 16,
    fontFamily: 'Quicksand-Bold',
    color: theme.mint,
    marginBottom: 5
  },
  toolSubtitle: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: theme.text,
    marginBottom: 5
  },
  modalView: {
    margin: 10,
    backgroundColor: theme.background,
    borderRadius: 30,
    padding: 35,
    alignItems: "left",
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 5
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Quicksand-Bold',
    color: theme.text
  },
  closeButton: {
    color: theme.primary,
    fontFamily: 'Quicksand-Bold'
  },
  modalContent: {
    width: '100%'
  },
  filterSection: {
    marginBottom: 20,
    width: '100%'
  },
  filterLabel: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    marginBottom: 8,
    color: theme.subtext
  },
  dateInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  dateButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    width: '48%'
  },
  dateButtonText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium'
  },
  picker: {
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize:14,
    fontFamily: 'Montserrat-Medium',
    color: theme.text,
    flex:1,
    borderWidth:1,
    borderColor:theme.border,
    padding:10,
    marginBottom:10,
  },
  modalFooter: {
    marginTop: 20,
    width: '100%'
  },
  buttonClose: {
    backgroundColor: theme.primary
  },
  textStyle: {
    color: 'black',
    fontFamily: 'Quicksand-Bold'
  },
  logo: {
    width: 72,
    height: 72,
    resizeMode: 'contain'
  },
  logoText: {
    fontSize: 32, 
    color: theme.primary, 
    fontFamily: 'Quicksand-Bold', 
    marginBottom: 20
  },
  title: {
    fontSize: 24, 
    fontFamily: 'Quicksand-Bold', 
    marginTop: 20,
    color: theme.text
  },
  h1: {
    fontSize: 24, 
    fontFamily: 'Quicksand-Bold', 
    marginTop: 20,
    color: theme.text,
    marginBottom:22
  },
  h2: {
    fontSize: 16, 
    fontFamily: 'Montserrat-Bold', 
    marginTop: 20,
    color: theme.text
  },
  label: {
    fontSize: 12, 
    fontFamily: 'Montserrat-Regular',
    color: theme.subtext
  },
  input: {
    borderWidth: 1,
    borderColor: '#05354730',
    borderRadius: 25,
    padding: 10,
    marginBottom: 10,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 14,
    color: theme.text,
    fontFamily: 'Montserrat-Medium',
    borderWidth:1,
    borderColor:theme.border,
    borderRadius:25,
    padding:10,
    marginVertical:10,
    alignItems:'center',
    justifyContent:'center'
  },
  button: {
    backgroundColor: theme.primary,
    padding: 13,
    paddingHorizontal:20,
    borderRadius: 50,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    flexDirection:'row',
    gap:3
  },
  buttonText: {
    color: 'black', 
    fontFamily: 'Montserrat-SemiBold',
    fontSize:12
  },
  dateInput: {
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Montserrat-Medium',
    color: theme.text
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },

  formSection: {
    width: '100%'
  },
  p:{
    fontFamily:'Montserrat-Regular',
    fontSize: 12,
    color: theme.text
  },
  resumeContainer:{
    alignItems: 'center',
    justifyContent: 'center'
},
monthBalance:{
    fontSize: 48,
    fontFamily: 'Montserrat-SemiBold',
    color: theme.text,
}, 
percentage:{
    fontSize: 18,
    color: theme.primary
},
incomes:{
    fontSize: 18, 
    fontFamily: 'Montserrat-Medium',
    color: theme.text,
},
spendings:{
    fontSize: 18,
    fontFamily: 'Montserrat-Medium',
    color: theme.text,    
},
detailsContainer:{
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom:20
},
detailContainer:{

},
modalOverlay: {
  backgroundColor: hexToRgba(theme.background, 0.4),
  flex:1
},
menuContainer: {
  backgroundColor: theme.surface,
  position:'absolute',
  top:40,
  right:40,
  borderRadius: 15,
  padding: 10,
  width: 200,
},
menuItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 12,
  paddingHorizontal: 15,
},
menuIcon: {
  marginRight: 15,
},
menuText: {
  fontSize: 12,
  fontFamily: 'Montserrat-Regular',
},
divider: {
  height: 1,
  backgroundColor: theme.background,
  marginVertical: 4,
},
profileSection: {
  alignItems: 'center',
  padding: 24,
  backgroundColor: theme.surface,
},
avatarContainer: {
  marginBottom: 16,
},
avatar: {
  width: 80,
  height: 80,
  borderRadius: 40,
  justifyContent: 'center',
  alignItems: 'center',
},
avatarText: {
  color: '#fff',
  fontSize: 32,
  fontWeight: 'bold',
},
userName: {
  fontSize: 20,
  fontWeight: '600',
  color: theme.text,
  marginBottom: 4,
},
userEmail: {
  fontSize: 14,
  color: theme.subtext,
},
section: {
  marginTop: 16,
  backgroundColor: theme.surface,
  borderRadius: 12,
  marginHorizontal: 16,
  overflow: 'hidden',
},
sectionTitle: {
  fontSize: 14,
  fontWeight: '600',
  color: theme.subtext,
  padding: 16,
  paddingBottom: 8,
},
sectionContent: {
  backgroundColor: theme.surface,
  borderRadius: 12,
  overflow: 'hidden',
},
settingIcon: {
  width: 24,
  height: 24,
  marginRight: 16,
  justifyContent: 'center',
  alignItems: 'center',
},
settingText: {
  fontSize: 16,
  color: theme.text,
},
languageText: {
  fontSize: 14,
  color: theme.subtext,
  marginRight: 8,
},
header: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 24,
},
backButton: {
  marginRight: 16,
  padding: 8,
},
card: {
  backgroundColor: theme.surface,
  borderRadius: 16,
  padding: 20,
  marginBottom: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 3,
},
amountContainer: {
  alignItems: 'center',
  marginBottom: 22,
  paddingVertical: 12,
},
amountLabel: {
  fontSize: 12,
  fontFamily: 'Montserrat-Medium',
  color: theme.subtext,
  marginBottom: 8,
},
amount: {
  fontSize: 24,
  fontFamily: 'Montserrat-SemiBold',
},
amountIncome: {
  color: '#10B981', // Green for income
},
amountExpense: {
  color: '#EF4444', // Red for expense
},
detailRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: theme.border,
},
detailLabel: {
  fontSize: 12,
  fontFamily: 'Montserrat-Regular',
  color: theme.subtext,
  flex: 1,
},
detailValue: {
  fontSize: 14,
  fontFamily: 'Montserrat-Regular',
  color: theme.text,
  textAlign: 'right',
  flex: 1,
},
actionButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 24,
},
editButton: {
  backgroundColor: theme.primary,
  marginRight: 12,
},
deleteButton: {
  backgroundColor: '#FEE2E2',
},
editButtonText: {
  color: '#FFFFFF',
},
deleteButtonText: {
  color: '#DC2626',
},
icon: {
  marginRight: 8,
},
loadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
errorContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
},
errorText: {
  color: theme.error,
  textAlign: 'center',
  marginBottom: 20,
},
retryButton: {
  backgroundColor: theme.primary,
  paddingHorizontal: 20,
  paddingVertical: 10,
  borderRadius: 8,
},
retryButtonText: {
  color: '#FFFFFF',
  fontFamily: 'Montserrat-SemiBold',
},
transactionTypeIcon: {
  width: 24,
  height: 24,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 12,
},
transactionTypeIconIncome: {
  backgroundColor: '#D1FAE5',
},
transactionTypeIconExpense: {
  backgroundColor: '#FEE2E2',
},
transactionTypeIconTransfer: {
  backgroundColor: '#E0F2FE',
},
headerContent: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent:'center',
  flex: 1,
},
base: {
  flexGrow: 1,
  padding: 10,
  borderRadius: 25,
  alignItems: 'center',
  justifyContent: 'center',
},
active: {
  backgroundColor: theme.primary,
},
disable: {
  backgroundColor: theme.surface,
},
activeText: {
  color: theme.black,
},
disableText: {
  color: theme.subtext,
}
})};