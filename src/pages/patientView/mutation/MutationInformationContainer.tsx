import * as React from "react";
import mockData from "./mock/mutationData.json";
import MutationTable from "../../../shared/components/mutationTable/MutationTable";
import {IColumnDefMap} from "../../../shared/components/enhancedReactTable/IEnhancedReactTableProps";
import ProteinChangeColumnFormatter from "./column/ProteinChangeColumnFormatter";
import TumorColumnFormatter from "./column/TumorColumnFormatter";
import AlleleFreqColumnFormatter from "./column/AlleleFreqColumnFormatter";
import AlleleCountColumnFormatter from "./column/AlleleCountColumnFormatter";

export interface IMutationInformationContainerProps {
    // setTab?: (activeTab:number) => void;
    store?: any;
    sampleOrder:string[];
    sampleColors:{ [s:string]: string};
    sampleLabels:{ [s:string]: string};
    sampleTumorType:{ [s:string]: string};
    sampleCancerType:{ [s:string]: string};
};

export default class MutationInformationContainer extends React.Component<IMutationInformationContainerProps, {}> {
    constructor() {
        super();
        this.mergedMutations = this.mergeMutations(mockData);
    }

    public render() {
        // TODO properly customize table for patient view specific columns!!!
        let columns:IColumnDefMap = {
            sampleId: {
                name: "Sample Id", // name does not matter when the column is "excluded"
                visible: "excluded"
            },
            proteinChange: {
                name: "Protein Change",
                formatter: ProteinChangeColumnFormatter.renderFunction
            },
            tumors: {
                name: "Tumors",
                formatter: TumorColumnFormatter.renderFunction,
                sortable: TumorColumnFormatter.sortFunction,
                filterable: false,
                columnProps: {
                    sampleOrder: this.props.sampleOrder,
                    sampleColors: this.props.sampleColors,
                    sampleLabels: this.props.sampleLabels,
                    sampleTumorType: this.props.sampleTumorType,
                    sampleCancerType: this.props.sampleCancerType
                }
            },
            annotation: {
                name: "Annotation"
            },
            copyNumber: {
                name: "Copy #"
            },
            mRnaExp: {
                name: "mRNA Exp."
            },
            cohort: {
                name: "Cohort"
            },
            cosmic: {
                name: "COSMIC"
            },
            normalAlleleFreq : {
                name: "Allele Freq (N)",
                visible: "excluded"
            },
            tumorAlleleFreq: {
                name: "Variant Allele Frequency",
                formatter: AlleleFreqColumnFormatter.renderFunction,
                sortable: AlleleFreqColumnFormatter.sortFunction,
                filterable: false,
                columnProps: {
                    sampleOrder: this.props.sampleOrder,
                    sampleColors: this.props.sampleColors,
                    sampleLabels: this.props.sampleLabels
                }
            },
            normalRefCount: {
                name: "Ref Count (N)",
                formatter: AlleleCountColumnFormatter.renderFunction,
                columnProps: {
                    dataField: "normalRefCount",
                    sampleOrder: this.props.sampleOrder
                }
            },
            normalAltCount: {
                name: "Alt Count (N)",
                formatter: AlleleCountColumnFormatter.renderFunction,
                columnProps: {
                    dataField: "normalAltCount",
                    sampleOrder: this.props.sampleOrder
                }
            },
            tumorRefCount: {
                name: "Ref Count (T)",
                formatter: AlleleCountColumnFormatter.renderFunction,
                columnProps: {
                    dataField: "tumorRefCount",
                    sampleOrder: this.props.sampleOrder
                }
            },
            tumorAltCount: {
                name: "Alt Count (T)",
                formatter: AlleleCountColumnFormatter.renderFunction,
                columnProps: {
                    dataField: "tumorAltCount",
                    sampleOrder: this.props.sampleOrder
                }
            },
        };

        return (
            <div>
                <MutationTable rawData={this.mergedMutations} columns={columns}/>
            </div>
        );
    }

    private mergeMutations(data) {
        let idToMutations = {};
        let mutationId;
        for (let mutation of data) {
            mutationId = this.getMutationId(mutation);
            idToMutations[mutationId] = idToMutations[mutationId] || [];
            idToMutations[mutationId].push(mutation);
        }
        return Object.keys(idToMutations).map(id => idToMutations[id]);
    }

    private getMutationId(m):string {
        return [m.gene.chromosome, m.startPos, m.endPos, m.referenceAllele, m.variantAllele].join("_");
    }
}