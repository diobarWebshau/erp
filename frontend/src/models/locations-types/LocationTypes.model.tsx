// import GenericTable
//     from '../../components/ui/table/Table';
// import type {
//     ILocationType,
//     IPartialLocationType
// } from '../../interfaces/locationTypes';
// import {
//     defaultValueLocationType,
//     defaultValuePartialLocationType,
// } from '../../interfaces/locationTypes';
// import {
//     fetchLocationTypesFromDB,
//     createLocationTypeInDB,
//     deleteLocationTypeInDB,
//     updateLocationTypeInDB
// } from '../../queries/locationTypesQueries';
// import {
//     columnsLocationTypes
// } from '../locations-types/structure/columns';
// import {
//     useEffect,
//     useState
// } from 'react';
// import AddModal
//     from './modals/add/AddModal';
// import DeleteModal
//     from './modals/delete/DeleteModal';
// import EditModal
//     from './modals/edit/EditModal';
// import {
//     getChangedFields
// } from './utils/getChangedFields';

// const LocationTypesModel = () => {

//     /* States */

//     // model
//     const [locationTypes, setLocationTypes] =
//         useState<ILocationType[]>([]);
//     const [locationTypeRecord, setLocationTypeRecord] =
//         useState<
//             IPartialLocationType
//         >(defaultValuePartialLocationType);
//     const [deleteLocationTypeRecord, setDeleteLocationType] =
//         useState<ILocationType>(defaultValueLocationType);
//     const [originalLocationTypeRecord, setOriginalLocationTypeRecord] =
//         useState<ILocationType>(defaultValueLocationType);
//     // modales
//     const [isActiveAddModal, setIsActiveAddModal] =
//         useState<boolean>(false);
//     const [isActiveEditModal, setIsActiveEditModal] =
//         useState<boolean>(false);
//     const [isActiveDeleteModal, setIsActiveDeleteModal] =
//         useState<boolean>(false);
//     const [validation, setValidation] =
//         useState<string[]>([]);

//     /* Functions */


//     const extractValidations = (
//         response: any,
//         setValidation: React.Dispatch<React.SetStateAction<string[]>>
//     ): boolean => {
//         if (response?.validation) {
//             const validations = Array.isArray(response.validation)
//                 ? response.validation
//                 : [response.validation];
//             setValidation(validations);
//             return true;
//         }
//         return false;
//     };

//     const fetchLocationTypes = async () => {
//         try {
//             const data = await fetchLocationTypesFromDB(dis);
//             setLocationTypes(data ?? []);
//         } catch (error) {
//             console.error(`Error fetching location types:`, error);
//         }
//     };

//     const handleCreateLocationType = async () => {
//         try {
//             const response =
//                 await createLocationTypeInDB(locationTypeRecord);
//             if (extractValidations(response, setValidation)) return;
//             setIsActiveAddModal(false);
//             await fetchLocationTypes();
//         } catch (error) {
//             console.error(`Error creating location type:`, error);
//         }
//     };

//     const handleDeleteLocationType = async () => {
//         try {
//             setValidation([]);
//             const response =
//                 await deleteLocationTypeInBD(deleteLocationTypeRecord.id);
//             if (extractValidations(response, setValidation)) return;
//             setIsActiveDeleteModal(false);
//             await fetchLocationTypes();
//         } catch (error) {
//             console.error(`Error deleting location type:`, error);
//         }
//     };

//     const handleEditLocationType = async () => {
//         try {
//             const update_values =
//                 getChangedFields(
//                     originalLocationTypeRecord,
//                     locationTypeRecord
//                 );
//             const response =
//                 await updateLocationTypeInDB(
//                     originalLocationTypeRecord.id,
//                     update_values
//                 );
//             if (extractValidations(response, setValidation)) return;
//             setIsActiveEditModal(false);
//             await fetchLocationTypes();
//         } catch (error) {
//             console.error(`Error deleting location type:`, error);
//         }
//     }

//     /* Modals management */

//     const toggleVisibleEditModal = (locationType: ILocationType) => {
//         setValidation([])
//         setOriginalLocationTypeRecord(locationType);
//         setLocationTypeRecord({ ...locationType });
//         setIsActiveEditModal(!isActiveEditModal);
//     }
//     const toggleVisibleAddModal = () => {
//         setValidation([])
//         setLocationTypeRecord(defaultValuePartialLocationType);
//         setIsActiveAddModal(!isActiveAddModal);
//     }
//     const toggleVisibleDeleteModal = (locationType: ILocationType) => {
//         setValidation([])
//         setDeleteLocationType(locationType);
//         setIsActiveDeleteModal(!isActiveAddModal);
//     }

//     /* Effects */
//     useEffect(() => {
//         fetchLocationTypes();
//     }, []);

//     /* Render */
//     return (
//         <div>
//             <GenericTable<ILocationType>
//                 modelName='Location types'
//                 columns={columnsLocationTypes}
//                 data={locationTypes}
//                 onAdd={toggleVisibleAddModal}
//                 onDelete={toggleVisibleDeleteModal}
//                 onEdit={toggleVisibleEditModal}
//                 onDeleteSelected={
//                     () => console.log('Selection many rows')
//                 }
//             />
//             {isActiveAddModal && <AddModal
//                 onClose={setIsActiveAddModal}
//                 value={locationTypeRecord}
//                 onValue={setLocationTypeRecord}
//                 onCreate={handleCreateLocationType}
//                 validation={validation}
//             />}
//             {isActiveEditModal && <EditModal
//                 onClose={setIsActiveEditModal}
//                 validation={validation}
//                 value={locationTypeRecord}
//                 onValue={setLocationTypeRecord}
//                 onEdit={handleEditLocationType}
//                 originalRecord={originalLocationTypeRecord}
//             />}
//             {isActiveDeleteModal && <DeleteModal
//                 onClose={() => setIsActiveDeleteModal(false)}
//                 onDelete={handleDeleteLocationType}
//                 validation={validation}
//             />}
//         </div>
//     )
// }

// export default LocationTypesModel;