import CriticalActionButton from "../../../../../../../comp/primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/main-action/MainActionButtonCustom";
import TertiaryActionButtonCustom from "../../../../../../../comp/primitives/button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import { Bookmark, ChevronLeft, CircleCheck } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import StyleModule from "./Step3.module.css"
import type { ProductionLineAction, ProductionLineState } from "../../../../../context/productionLineTypes";
import type { Dispatch } from "react";
import { back_step } from "../../../../../context/productionLineActions";
import type { ColumnDef } from "@tanstack/react-table";
import type { IPartialProductionLineProduct } from "interfaces/productionLinesProducts";
import GenericTableMemo from "../../../../../../../comp/primitives/table/tableContext/GenericTable";
import { Divider } from "@mantine/core";
import Tag from "../../../../../../../comp/primitives/tag/Tag";
import type { IPartialProductionLine } from "../../../../../../../interfaces/productionLines";
import FeedBackModal from "../../../../../../../comp/primitives/modal2/dialog-modal/custom/feedback/FeedBackModal";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../../../../store/store";
import ToastMantine from "../../../../../../../comp/external/mantine/toast/base/ToastMantine";

interface IStep3 {
    onCancel: () => void;
    onCreate: (data: IPartialProductionLine) => Promise<void>;
    onClose: () => void;
    state: ProductionLineState,
    dispatch: Dispatch<ProductionLineAction>
}

const Step3 = memo(({
    onCancel, onCreate, onClose,
    state, dispatch
}: IStep3) => {

    const errorRedux = useSelector((state: RootState) => state.error);
    const getRowId = useMemo(() => (row: IPartialProductionLineProduct) => row.id?.toString()!, []);
    const [isActiveFeedBackModal, setIsActiveFeedBackModal] = useState<boolean>(false);

    const customMessageNode = useMemo(() => {
        return (
            <div className={StyleModule.containerCustomMessageNode}>
                <span className={`nunito-bold ${StyleModule.titleCustomMessageNode}`}>
                    La  <span>{` ${state.data?.name} `}</span> se ha agregado correctamente
                </span>
                <span className={`nunito-semibold ${StyleModule.messageCustomMessageNode}`}>
                    Ya puedes visualizar su estado desde el panel principal de líneas de producción.
                </span>
            </div>
        );
    }, [state.data]);

    const columns: ColumnDef<IPartialProductionLineProduct>[] = useMemo(() => [
        {
            accessorFn: (row) => row.products?.sku,
            header: "SKU",
        },
        {
            accessorFn: (row) => row.products?.name,
            header: "Producto",
        },
        {
            accessorFn: (row) => row.products?.description,
            header: "Descripción",
        }
    ], []);

    const handleOnClickBack = useCallback(() => {
        dispatch(back_step());
    }, [dispatch]);

    const handleOnSaveAndExit = useCallback(() => {
        console.log("Guardar y continuar");
    }, []);

    const handleOnSaveAndFinish = useCallback(async () => {
        await onCreate(state.data);
        if (Object.keys(errorRedux).length > 0) {
            Object.entries(errorRedux).forEach((_, entry) => {
                ToastMantine.error({
                    message: entry,
                });
            });
            return;
        }
        setIsActiveFeedBackModal(true);
    }, [state.data, onCreate, errorRedux, ToastMantine]);

    const handleOnCloseFeedBackModal = useCallback(() => {
        onClose();
        setIsActiveFeedBackModal(false);
    }, [onClose]);

    return <div className={StyleModule.containerStep}>
        <div className={StyleModule.containerContent}>
            <div className={StyleModule.firstBlock}>
                <h2 className={`nunito-bold ${StyleModule.subTitle}`}>Información en línea</h2>
                <dl className={StyleModule.dl}>
                    <dt className={`nunito-regular`}>Nombre la línea de producción:</dt>
                    <dd>{state.data?.name}</dd>
                </dl>
                <dl className={StyleModule.dl}>
                    <dt className={`nunito-regular`}>ID único:</dt>
                    <dd>{state.data?.custom_id}</dd>
                </dl>
                <dl className={StyleModule.dl}>
                    <dt className={`nunito-regular`}>Ubicación:</dt>
                    <dd>{state.data?.location_production_line?.location?.name}</dd>
                </dl>
            </div>
            <div className={StyleModule.secondBlock}>
                <h2 className={`nunito-bold ${StyleModule.subTitle}`}>Configuración</h2>
                <span className={`nunito-bold ${StyleModule.label}`}>Productos asociados</span>
                <GenericTableMemo
                    /* modelo e identificador */
                    modelName="products"
                    getRowId={getRowId}
                    /* data y columnas */
                    columns={columns}
                    data={state.data?.production_lines_products || []}
                />
                <div className={StyleModule.statusBlock}>
                    <dl className={StyleModule.dlStatus}>
                        <dt className={`nunito-bold`}>Estado de la línea:</dt>
                        <dd>
                            <Tag
                                label={state.data?.is_active ? "Activa" : "Inactiva"}
                                className={state.data?.is_active ? StyleModule.tagActive : StyleModule.tagInactive}
                            />
                        </dd>
                    </dl>
                </div>
                <Divider color="var(--color-theme-primary-light)" />
            </div>
        </div>
        <div className={StyleModule.containerButtons}>
            <CriticalActionButton
                onClick={onCancel}
                label="Cancelar"
            />
            <TertiaryActionButtonCustom
                onClick={handleOnClickBack}
                label="Regresar"
                icon={<ChevronLeft />}
            />
            <TertiaryActionButtonCustom
                onClick={handleOnSaveAndExit}
                label="Guardar y salir"
                icon={<Bookmark />}
            />
            <MainActionButtonCustom
                onClick={handleOnSaveAndFinish}
                label="Guardar y finalizar"
                icon={<Bookmark />}
            />
        </div>
        {
            isActiveFeedBackModal && (
                <FeedBackModal
                    onClose={handleOnCloseFeedBackModal}
                    icon={<CircleCheck />}
                    messageCustom={customMessageNode}
                />
            )
        }
    </div>;
})

export default Step3;